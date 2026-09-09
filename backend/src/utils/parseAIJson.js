// Extract the first top-level JSON object/array from an AI response.
// Handles code fences and surrounding prose (e.g. "Here is the JSON: {...}").
function extractJsonBlock(text) {
  const stripped = String(text)
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();

  // Fast path: already clean JSON.
  if (/^[[{]/.test(stripped)) return stripped;

  // Otherwise find the first {...} or [...] block.
  const firstObj = stripped.indexOf('{');
  const firstArr = stripped.indexOf('[');
  const candidates = [firstObj, firstArr].filter((i) => i >= 0);
  if (!candidates.length) return stripped;

  const start = Math.min(...candidates);
  const open = stripped[start];
  const close = open === '{' ? '}' : ']';
  const end = stripped.lastIndexOf(close);
  if (end > start) return stripped.slice(start, end + 1);
  return stripped;
}

export function parseAIJson(text, fallback) {
  try {
    return JSON.parse(extractJsonBlock(text));
  } catch (err) {
    // Surface format regressions instead of silently returning fallback.
    console.warn(`[parseAIJson] Failed to parse AI JSON, using fallback: ${err.message}`);
    return fallback;
  }
}
