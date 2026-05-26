import { dbState } from '../config/db.js';
import InterviewSession from '../models/InterviewSession.js';
import InterviewMessage from '../models/InterviewMessage.js';

const memoryVoiceSessions = [];
const memoryVoiceMessages = [];

export function createId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

export function secondsRemaining(session) {
  const elapsed = (Date.now() - new Date(session.startedAt).getTime()) / 1000;
  return Math.max(0, Math.round((session.durationMinutes * 60) - elapsed));
}

export async function createVoiceSession(data) {
  if (dbState.isConnected) {
    const session = await InterviewSession.create(data);
    console.log(`[DB] Voice interview session saved to MongoDB: ${session._id}`);
    return session;
  }
  console.warn('[DB] Voice interview session saved to memory fallback, not MongoDB.');
  const session = { ...data, _id: createId(), createdAt: new Date().toISOString() };
  memoryVoiceSessions.push(session);
  return session;
}

export async function updateVoiceSession(sessionId, patch) {
  if (dbState.isConnected) return InterviewSession.findByIdAndUpdate(sessionId, patch, { new: true });
  const index = memoryVoiceSessions.findIndex((session) => String(session._id) === String(sessionId));
  if (index >= 0) memoryVoiceSessions[index] = { ...memoryVoiceSessions[index], ...patch };
  return memoryVoiceSessions[index];
}

export async function findVoiceSession(sessionId, userId) {
  if (dbState.isConnected) return InterviewSession.findOne({ _id: sessionId, userId, mode: 'voice' });
  return memoryVoiceSessions.find((session) => String(session._id) === String(sessionId) && String(session.userId) === String(userId));
}

export async function listVoiceSessions(userId) {
  if (dbState.isConnected) return InterviewSession.find({ userId, mode: 'voice' }).sort({ createdAt: -1 }).limit(50);
  return memoryVoiceSessions.filter((session) => String(session.userId) === String(userId)).reverse();
}

export async function saveVoiceMessage(message) {
  if (dbState.isConnected) return InterviewMessage.create({ ...message, mode: 'voice' });
  const local = { ...message, mode: 'voice', _id: createId(), createdAt: new Date().toISOString() };
  memoryVoiceMessages.push(local);
  return local;
}

export async function getVoiceMessages(sessionId) {
  if (dbState.isConnected) return InterviewMessage.find({ sessionId, mode: 'voice' }).sort({ createdAt: 1 });
  return memoryVoiceMessages.filter((message) => String(message.sessionId) === String(sessionId));
}

export function fallbackVoiceFeedback(transcript, question, interviewType) {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.max(2, Math.min(10, Math.round(wordCount / 18) + (/impact|built|designed|secured|optimized|tested/i.test(transcript) ? 2 : 0)));
  const nextQuestion = interviewType === 'System Design Interview'
    ? 'How would you scale that design if the user base grew ten times?'
    : score >= 8
      ? 'Good. Can you go deeper into one technical decision and its tradeoff?'
      : 'Can you give one concrete example from a project to support your answer?';

  return {
    score,
    feedback: score >= 8 ? 'Good answer with useful detail. Add one metric or tradeoff to make it stronger.' : 'Your answer is understandable, but it needs more structure, example, and measurable impact.',
    shortSpokenFeedback: `Good effort. Your score is ${score} out of 10. Here is the next question.`,
    betterAnswer: `A stronger answer would directly answer "${question}", explain your action, mention tools or tradeoffs, and end with impact.`,
    mistakes: wordCount < 35 ? ['Answer was too short', 'Missing concrete project evidence'] : ['Needs clearer impact or tradeoff'],
    nextQuestion,
  };
}

export function fallbackVoiceReport(messages) {
  const scores = messages.map((message) => message.score).filter(Boolean);
  const avg = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 6;
  return {
    overallScore: avg * 10,
    communicationScore: avg,
    technicalScore: Math.max(1, avg - 1),
    problemSolvingScore: avg,
    confidenceScore: avg,
    clarityScore: avg,
    strengths: ['Able to respond in spoken format', 'Shows practical learning attitude', 'Can connect answers to projects'],
    weaknesses: ['Needs more measurable impact', 'Should structure answers more clearly', 'Needs deeper technical tradeoffs'],
    bestAnswer: 'Best answer showed practical project understanding.',
    weakestAnswer: 'Weakest answer lacked depth or a specific example.',
    improvementPlan: ['Use STAR structure', 'Mention tools and tradeoffs', 'Add metrics to project stories', 'Practice 60-second answers'],
    recommendedPracticeTopics: ['Project architecture', 'API security', 'Performance tradeoffs'],
    finalVerdict: 'Promising voice interview performance, but needs clearer structure and stronger technical proof.',
  };
}
