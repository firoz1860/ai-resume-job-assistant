import { buildVoiceInterviewStartPrompt } from '../prompts/voiceInterviewStartPrompt.js';
import { buildVoiceInterviewEvaluatePrompt } from '../prompts/voiceInterviewEvaluatePrompt.js';
import { buildVoiceInterviewReportPrompt } from '../prompts/voiceInterviewReportPrompt.js';
import { generateContent } from '../services/aiService.js';
import {
  createVoiceSession,
  fallbackVoiceFeedback,
  fallbackVoiceReport,
  findVoiceSession,
  getVoiceMessages,
  listVoiceSessions,
  saveVoiceMessage,
  secondsRemaining,
  updateVoiceSession,
} from '../services/voiceInterviewService.js';
import { parseAIJson } from '../utils/parseAIJson.js';

function cleanQuestion(text) {
  return String(text || '').trim().replace(/^["']|["']$/g, '').trim();
}

function fallbackFirstQuestion({ targetRole, interviewType }) {
  if (interviewType === 'HR Interview') return `Tell me about yourself and why you are targeting ${targetRole}.`;
  if (interviewType === 'Project-Based Interview') return 'Walk me through your strongest project and one important decision you made.';
  if (interviewType === 'System Design Interview') return `How would you design a practical system for a ${targetRole} workflow?`;
  return `Explain one core concept you recently used for a ${targetRole} role.`;
}

function buildCounterQuestion({ transcript, currentQuestion, interviewType, targetRole }) {
  const lower = transcript.toLowerCase();
  if (lower.includes('mongodb') || lower.includes('database')) return 'Why did you choose that database, and what tradeoff did it create?';
  if (lower.includes('jwt') || lower.includes('auth')) return 'How did you secure authentication and protect private routes in that project?';
  if (lower.includes('react') || lower.includes('frontend')) return 'How did you manage state and handle performance in the frontend?';
  if (lower.includes('api') || lower.includes('express') || lower.includes('node')) return 'Can you explain the API flow from request validation to response handling?';
  if (interviewType === 'HR Interview') return 'Can you share a specific situation where you handled pressure or a setback?';
  if (interviewType === 'System Design Interview') return 'How would you scale this solution if traffic increased significantly?';
  return `Can you give one concrete project example that proves your readiness for a ${targetRole} role?`;
}

export async function startVoiceInterview(req, res, next) {
  try {
    const { targetRole, interviewType = 'Mixed Interview', difficulty = 'Medium', skills, projects, experience, jobDescription } = req.body;
    const durationMinutes = 20;
    if (!targetRole?.trim()) return res.status(400).json({ success: false, error: 'Target role is required.' });

    let question = fallbackFirstQuestion({ targetRole, interviewType });
    try {
      question = cleanQuestion(await generateContent(buildVoiceInterviewStartPrompt({ targetRole, interviewType, difficulty, skills, projects, experience, jobDescription })));
    } catch {}

    const session = await createVoiceSession({
      userId: req.user._id,
      mode: 'voice',
      voiceEnabled: true,
      targetRole,
      interviewType,
      difficulty,
      skills,
      projects,
      experience,
      jobDescription,
      durationMinutes,
      status: 'active',
      startedAt: new Date(),
      questionsAsked: 1,
      transcripts: [],
    });

    await saveVoiceMessage({ sessionId: session._id, userId: req.user._id, role: 'ai', question });

    res.json({ success: true, message: 'Voice interview started.', data: { sessionId: session._id, question, startedAt: session.startedAt, durationMinutes, status: 'active', timeRemaining: secondsRemaining(session) } });
  } catch (err) {
    next(err);
  }
}

export async function answerVoiceInterview(req, res, next) {
  try {
    const { sessionId, transcript, speakingTimeSeconds } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'Session ID is required.' });
    if (!transcript?.trim()) return res.status(400).json({ success: false, error: 'Transcript is required.' });
    if (transcript.length > 5000) return res.status(400).json({ success: false, error: 'Transcript is too long.' });

    const session = await findVoiceSession(sessionId, req.user._id);
    if (!session) return res.status(404).json({ success: false, error: 'Voice interview session not found.' });
    if (session.status !== 'active') return res.status(400).json({ success: false, error: 'Voice interview is not active.' });
    if (secondsRemaining(session) <= 0) {
      await updateVoiceSession(sessionId, { status: 'expired', endedAt: new Date() });
      return res.status(408).json({ success: false, error: 'Interview time is over.', data: { shouldEnd: true } });
    }

    const messages = await getVoiceMessages(sessionId);
    const currentQuestion = [...messages].reverse().find((message) => message.role === 'ai' && message.question)?.question || 'Tell me about yourself.';
    await saveVoiceMessage({ sessionId, userId: req.user._id, role: 'user', answer: transcript, transcript, speakingTimeSeconds });

    const history = messages.slice(-8).map((message) => `${message.role}: ${message.question || message.transcript || message.feedback || ''}`).join('\n');
    let evaluation = fallbackVoiceFeedback(transcript, currentQuestion, session.interviewType);

    try {
      const aiText = await generateContent(buildVoiceInterviewEvaluatePrompt({ targetRole: session.targetRole, interviewType: session.interviewType, difficulty: session.difficulty, currentQuestion, transcript, history }));
      evaluation = parseAIJson(aiText, evaluation);
    } catch {}

    evaluation.nextQuestion = cleanQuestion(evaluation.nextQuestion);
    if (!evaluation.nextQuestion || evaluation.nextQuestion.length < 12) {
      evaluation.nextQuestion = buildCounterQuestion({ transcript, currentQuestion, interviewType: session.interviewType, targetRole: session.targetRole });
    }
    if (!evaluation.shortSpokenFeedback) {
      evaluation.shortSpokenFeedback = `Your score is ${evaluation.score} out of 10. I will ask a follow-up question now.`;
    }
    await saveVoiceMessage({
      sessionId,
      userId: req.user._id,
      role: 'ai',
      question: evaluation.nextQuestion,
      feedback: evaluation.feedback,
      score: evaluation.score,
      betterAnswer: evaluation.betterAnswer,
      mistakes: evaluation.mistakes || [],
      nextQuestion: evaluation.nextQuestion,
    });
    await updateVoiceSession(sessionId, { questionsAsked: (session.questionsAsked || 0) + 1, transcripts: [...(session.transcripts || []), transcript] });

    res.json({ success: true, message: 'Voice answer evaluated.', data: { ...evaluation, timeRemaining: secondsRemaining(session), shouldEnd: false } });
  } catch (err) {
    next(err);
  }
}

export async function endVoiceInterview(req, res, next) {
  try {
    const { sessionId } = req.body;
    const session = await findVoiceSession(sessionId, req.user._id);
    if (!session) return res.status(404).json({ success: false, error: 'Voice interview session not found.' });

    const messages = await getVoiceMessages(sessionId);
    const conversation = messages.map((message) => `${message.role}: Q=${message.question || ''} Transcript=${message.transcript || ''} Feedback=${message.feedback || ''} Score=${message.score || ''}`).join('\n');
    let report = fallbackVoiceReport(messages);

    try {
      const aiText = await generateContent(buildVoiceInterviewReportPrompt({ interviewType: session.interviewType, targetRole: session.targetRole, conversation }));
      report = parseAIJson(aiText, report);
    } catch {}

    const updated = await updateVoiceSession(sessionId, { status: 'completed', endedAt: new Date(), finalReport: report, overallScore: report.overallScore });
    res.json({ success: true, message: 'Voice interview completed.', data: { session: updated, report } });
  } catch (err) {
    next(err);
  }
}

export async function voiceInterviewHistory(req, res, next) {
  try {
    const sessions = await listVoiceSessions(req.user._id);
    res.json({ success: true, message: 'Voice interview history.', data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function voiceInterviewDetail(req, res, next) {
  try {
    const session = await findVoiceSession(req.params.id, req.user._id);
    if (!session) return res.status(404).json({ success: false, error: 'Voice interview session not found.' });
    const messages = await getVoiceMessages(req.params.id);
    res.json({ success: true, message: 'Voice interview detail.', data: { session, messages } });
  } catch (err) {
    next(err);
  }
}
