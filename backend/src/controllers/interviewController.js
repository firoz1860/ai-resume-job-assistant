import { dbState } from '../config/db.js';
import InterviewSession from '../models/InterviewSession.js';
import InterviewMessage from '../models/InterviewMessage.js';
import { buildInterviewStartPrompt } from '../prompts/interviewStartPrompt.js';
import { buildInterviewFeedbackPrompt } from '../prompts/interviewFeedbackPrompt.js';
import { buildInterviewReportPrompt } from '../prompts/interviewReportPrompt.js';
import { generateContent } from '../services/aiService.js';
import { parseAIJson } from '../utils/parseAIJson.js';
import { isValidMongoId } from '../utils/validateId.js';

const memorySessions = [];
const memoryMessages = [];

const fallbackQuestions = {
  'HR Interview': 'Tell me about yourself and why this role is the right next step for you.',
  'Technical Interview': 'Explain one technical concept from your stack that you used in a recent project.',
  'Project-Based Interview': 'Walk me through your strongest project, including architecture, challenge, and impact.',
  'DSA Theory Interview': 'Explain time complexity and why it matters when choosing an algorithm.',
  'System Design Interview': 'How would you design a scalable authentication system for a web app?',
  'Mixed Interview': 'Tell me about a project you built and one technical decision you made.',
};

function id() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function minutesElapsed(startedAt) {
  return (Date.now() - new Date(startedAt).getTime()) / 60000;
}

function timeRemaining(session) {
  return Math.max(0, Math.round((session.durationMinutes * 60) - ((Date.now() - new Date(session.startedAt).getTime()) / 1000)));
}

async function saveSession(session) {
  if (dbState.isConnected) return InterviewSession.create(session);
  const local = { ...session, _id: id(), createdAt: new Date().toISOString() };
  memorySessions.push(local);
  return local;
}

async function updateSession(sessionId, patch) {
  if (dbState.isConnected) return InterviewSession.findByIdAndUpdate(sessionId, patch, { new: true });
  const index = memorySessions.findIndex((session) => String(session._id) === String(sessionId));
  if (index >= 0) memorySessions[index] = { ...memorySessions[index], ...patch };
  return memorySessions[index];
}

async function findSession(sessionId, userId) {
  if (dbState.isConnected) return InterviewSession.findOne({ _id: sessionId, userId, mode: { $ne: 'voice' } });
  return memorySessions.find((session) => String(session._id) === String(sessionId) && String(session.userId) === String(userId));
}

// Atomic increment so concurrent answers on the same session don't lose counts.
async function incQuestionsAsked(sessionId) {
  if (dbState.isConnected) return InterviewSession.findByIdAndUpdate(sessionId, { $inc: { questionsAsked: 1 } }, { new: true });
  const index = memorySessions.findIndex((session) => String(session._id) === String(sessionId));
  if (index >= 0) memorySessions[index].questionsAsked = (memorySessions[index].questionsAsked || 0) + 1;
  return memorySessions[index];
}

async function listSessions(userId) {
  if (dbState.isConnected) return InterviewSession.find({ userId, mode: { $ne: 'voice' } }).sort({ createdAt: -1 }).limit(50).lean();
  return memorySessions.filter((session) => String(session.userId) === String(userId)).reverse();
}

async function saveMessage(message) {
  if (dbState.isConnected) return InterviewMessage.create(message);
  const local = { ...message, _id: id(), createdAt: new Date().toISOString() };
  memoryMessages.push(local);
  return local;
}

async function getMessages(sessionId) {
  if (dbState.isConnected) return InterviewMessage.find({ sessionId }).sort({ createdAt: 1 }).lean();
  return memoryMessages.filter((message) => String(message.sessionId) === String(sessionId));
}

function fallbackFeedback(answer, question, interviewType) {
  const wordCount = answer.trim().split(/\s+/).length;
  const score = Math.max(3, Math.min(10, Math.round(wordCount / 18) + (/impact|built|solved|improved|designed/i.test(answer) ? 2 : 0)));
  return {
    score,
    feedback: score >= 8 ? 'Clear answer with useful detail. Add measurable impact if possible.' : 'Good start, but the answer needs more structure, proof, and impact.',
    betterAnswer: `A stronger answer would directly address "${question}", explain your action, mention the technical decision, and close with a result.`,
    mistakes: wordCount < 50 ? ['Answer is too short.', 'Missing concrete example.'] : ['Needs clearer measurable impact.'],
    nextQuestion: interviewType === 'System Design Interview' ? 'How would you scale this solution if traffic increased 10x?' : 'Can you explain one challenge you faced and how you solved it?',
  };
}

function fallbackReport(messages) {
  const scores = messages.map((message) => message.score).filter(Boolean);
  const avg = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 6;
  return {
    overallScore: avg * 10,
    communicationScore: Math.max(1, avg),
    technicalScore: Math.max(1, avg - 1),
    problemSolvingScore: avg,
    confidenceScore: Math.max(1, avg),
    strengths: ['Shows willingness to explain work', 'Can connect answers to projects'],
    weaknesses: ['Needs more measurable impact', 'Should structure answers more clearly'],
    bestAnswer: 'Best answer showed practical project understanding.',
    weakestAnswer: 'Weakest answer lacked enough depth or examples.',
    improvementPlan: ['Use STAR structure', 'Add metrics to project stories', 'Practice concise technical explanations'],
    finalVerdict: 'Good fresher-level performance, but needs stronger proof and structured explanation.',
  };
}

function cleanQuestion(question) {
  return String(question || '').trim().replace(/^["']|["']$/g, '').trim();
}

export async function startInterview(req, res, next) {
  try {
    const { targetRole, interviewType = 'HR Interview', difficulty = 'Easy', skills, projects, experience, jobDescription, durationMinutes = 10 } = req.body;
    if (!targetRole?.trim()) return res.status(400).json({ success: false, error: 'Target role is required.' });

    let question = fallbackQuestions[interviewType] || fallbackQuestions['Mixed Interview'];
    try {
      question = cleanQuestion(await generateContent(buildInterviewStartPrompt({ targetRole, interviewType, difficulty, skills, projects, experience, jobDescription })));
    } catch {
      // AI quota/model errors should not block interview practice.
    }

    const session = await saveSession({
      userId: req.user._id,
      targetRole,
      interviewType,
      difficulty,
      skills,
      projects,
      experience,
      jobDescription,
      durationMinutes: Number(durationMinutes) || 10,
      status: 'active',
      startedAt: new Date(),
      questionsAsked: 1,
    });

    question = cleanQuestion(question);
    await saveMessage({ sessionId: session._id, userId: req.user._id, role: 'ai', question });

    res.json({ success: true, message: 'Interview started.', data: { sessionId: session._id, firstQuestion: question, question, startedAt: session.startedAt, durationMinutes: session.durationMinutes, timeRemaining: timeRemaining(session) } });
  } catch (err) {
    next(err);
  }
}

export async function answerInterview(req, res, next) {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId || !answer?.trim()) return res.status(400).json({ success: false, error: 'Session ID and answer are required.' });

    const session = await findSession(sessionId, req.user._id);
    if (!session) return res.status(404).json({ success: false, error: 'Interview session not found.' });
    if (session.status !== 'active') return res.status(400).json({ success: false, error: 'Interview session is not active.' });

    if (minutesElapsed(session.startedAt) >= session.durationMinutes) {
      await updateSession(sessionId, { status: 'expired', endedAt: new Date() });
      return res.status(408).json({ success: false, error: 'Interview time is over.', data: { expired: true } });
    }

    const messages = await getMessages(sessionId);
    const latestQuestion = [...messages].reverse().find((message) => message.role === 'ai' && message.question)?.question || 'Tell me about yourself.';
    await saveMessage({ sessionId, userId: req.user._id, role: 'user', answer });

    const history = messages.slice(-8).map((message) => `${message.role}: ${message.question || message.answer || message.feedback || ''}`).join('\n');
    let feedback = fallbackFeedback(answer, latestQuestion, session.interviewType);

    try {
      const aiText = await generateContent(buildInterviewFeedbackPrompt({ targetRole: session.targetRole, interviewType: session.interviewType, difficulty: session.difficulty, question: latestQuestion, answer, history }));
      feedback = parseAIJson(aiText, feedback);
    } catch {
      // Fallback keeps the flow reliable when AI is unavailable.
    }

    feedback.nextQuestion = cleanQuestion(feedback.nextQuestion);

    await saveMessage({
      sessionId,
      userId: req.user._id,
      role: 'ai',
      question: feedback.nextQuestion,
      feedback: feedback.feedback,
      score: feedback.score,
      betterAnswer: feedback.betterAnswer,
      mistakes: feedback.mistakes || [],
      nextQuestion: feedback.nextQuestion,
    });
    await incQuestionsAsked(sessionId);

    res.json({ success: true, message: 'Answer evaluated.', data: { ...feedback, timeRemaining: timeRemaining(session) } });
  } catch (err) {
    next(err);
  }
}

export async function endInterview(req, res, next) {
  try {
    const { sessionId } = req.body;
    const session = await findSession(sessionId, req.user._id);
    if (!session) return res.status(404).json({ success: false, error: 'Interview session not found.' });

    const messages = await getMessages(sessionId);
    const conversation = messages.map((message) => `${message.role}: Q=${message.question || ''} A=${message.answer || ''} Feedback=${message.feedback || ''} Score=${message.score || ''}`).join('\n');
    let report = fallbackReport(messages);

    try {
      const aiText = await generateContent(buildInterviewReportPrompt({ conversation }));
      report = parseAIJson(aiText, report);
    } catch {
      // Fallback report keeps end flow reliable.
    }

    const updated = await updateSession(sessionId, { status: 'completed', endedAt: new Date(), finalReport: report, overallScore: report.overallScore });
    res.json({ success: true, message: 'Interview completed.', data: { session: updated, report } });
  } catch (err) {
    next(err);
  }
}

export async function interviewHistory(req, res, next) {
  try {
    const sessions = await listSessions(req.user._id);
    res.json({ success: true, message: 'Interview history.', data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function interviewDetail(req, res, next) {
  try {
    if (dbState.isConnected && !isValidMongoId(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Interview session not found.' });
    }
    const session = await findSession(req.params.id, req.user._id);
    if (!session) return res.status(404).json({ success: false, error: 'Interview session not found.' });
    const messages = await getMessages(req.params.id);
    res.json({ success: true, message: 'Interview detail.', data: { session, messages } });
  } catch (err) {
    next(err);
  }
}
