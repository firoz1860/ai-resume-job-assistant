import axios from 'axios';
import { config } from '../config/env.js';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildGeminiPayload(promptSpec, model) {
  const isStructuredPrompt = typeof promptSpec === 'object' && promptSpec !== null;
  const userPrompt = isStructuredPrompt ? promptSpec.userPrompt : promptSpec;
  const maxOutputTokens = isStructuredPrompt ? promptSpec.maxOutputTokens : 2048;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.55,
      topK: 32,
      topP: 0.9,
      maxOutputTokens,
      responseMimeType: 'text/plain',
      thinkingConfig: model.startsWith('gemini-3') ? { thinkingLevel: 'minimal' } : { thinkingBudget: 0 },
    },
  };

  if (isStructuredPrompt && promptSpec.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: promptSpec.systemInstruction }] };
  }

  return payload;
}

async function callGemini(promptSpec, model) {
  const url = `${GEMINI_BASE}/${model}:generateContent`;

  const response = await axios.post(
    url,
    buildGeminiPayload(promptSpec, model),
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.aiApiKey,
      },
      timeout: 30000,
    }
  );

  return response;
}

function extractText(response) {
  const candidate = response.data?.candidates?.[0];
  if (!candidate) throw new Error('No response generated from AI model.');

  const textPart = candidate.content?.parts?.find((p) => typeof p.text === 'string' && p.text.trim());
  if (!textPart) throw new Error('AI returned an empty response.');

  return textPart.text.trim();
}

function geminiErrorDetail(err) {
  return err.response?.data?.error?.message || err.response?.data?.message || err.message;
}

function retryDelayMs(err, fallbackMs) {
  const retryAfter = Number(err.response?.headers?.['retry-after']);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }
  return fallbackMs;
}

export async function generateContent(promptSpec) {
  const MAX_RETRIES = 2;
  const RETRY_DELAY_MS = 6000;
  const TRANSIENT_DELAY_MS = 1500;
  let lastTransientError = null;

  for (const model of config.aiModels) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await callGemini(promptSpec, model);
        return extractText(response);
      } catch (err) {
        const status = err.response?.status;
        // Retryable: rate limit, server errors, and network/timeout (no response).
        // Retry within the model, then fall through to the next configured model.
        const isTransient = status === 429 || (typeof status === 'number' && status >= 500) || !err.response;

        if (isTransient) {
          lastTransientError = err;
          if (attempt < MAX_RETRIES) {
            const delay = status === 429 ? retryDelayMs(err, RETRY_DELAY_MS) : TRANSIENT_DELAY_MS;
            console.log(`[Retry] Gemini model "${model}" ${status || 'network error'}. Waiting ${delay / 1000}s before retry ${attempt + 1}/${MAX_RETRIES}.`);
            await sleep(delay);
            continue;
          }
          break; // retries exhausted for this model → try the next fallback model
        }

        if (status === 404) {
          throw Object.assign(
            new Error(`AI model "${model}" not found. Update AI_MODEL in backend/.env to the exact model that works in Postman, for example AI_MODEL=gemini-3.5-flash.`),
            { isOperational: true, status: 404 }
          );
        }

        if (status === 403) {
          throw Object.assign(
            new Error('API key is invalid or does not have access to this model. Check AI_API_KEY in backend/.env.'),
            { isOperational: true, status: 403 }
          );
        }

        if (status === 400) {
          const detail = geminiErrorDetail(err) || 'Bad request';
          throw Object.assign(
            new Error(`Gemini API rejected the request: ${detail}`),
            { isOperational: true, status: 400 }
          );
        }

        throw err;
      }
    }
  }

  const detail = geminiErrorDetail(lastTransientError);
  const modelList = config.aiModels.join(', ');
  const suffix = detail ? ` Gemini said: ${detail}` : '';
  const rateLimited = lastTransientError?.response?.status === 429;

  throw Object.assign(
    new Error(
      rateLimited
        ? `Rate limit reached for configured Gemini model(s): ${modelList}. Wait a minute or set AI_MODEL to the exact model that worked in Postman.${suffix}`
        : `AI service is temporarily unavailable across configured model(s): ${modelList}. Please try again shortly.${suffix}`
    ),
    { isOperational: true, status: rateLimited ? 429 : 503 }
  );
}
