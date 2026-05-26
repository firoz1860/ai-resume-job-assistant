import { useState } from 'react';
import { voiceInterviewApi } from '../services/api.js';

export default function useVoiceInterview() {
  const [state, setState] = useState('setup');
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const start = async (payload) => {
    setState('starting'); setError('');
    const data = await voiceInterviewApi.start(payload);
    setSession(data);
    setHistory([{ id: data.sessionId, question: data.question, transcript: '', feedback: null, score: null }]);
    setState('ai_speaking');
    return data;
  };

  const submitAnswer = async (transcript, speakingTimeSeconds) => {
    setState('evaluating'); setError('');
    const data = await voiceInterviewApi.answer({ sessionId: session.sessionId, transcript, speakingTimeSeconds });
    setFeedback(data);
    setHistory((items) => {
      const nextItems = [...items];
      const currentIndex = nextItems.length - 1;
      nextItems[currentIndex] = {
        ...nextItems[currentIndex],
        transcript,
        feedback: data.feedback,
        betterAnswer: data.betterAnswer,
        mistakes: data.mistakes || [],
        score: data.score,
      };
      nextItems.push({ id: `${session.sessionId}-${nextItems.length}`, question: data.nextQuestion, transcript: '', feedback: null, score: null });
      return nextItems;
    });
    setSession((current) => ({ ...current, question: data.nextQuestion, timeRemaining: data.timeRemaining }));
    setState('feedback');
    return data;
  };

  const end = async () => {
    if (!session?.sessionId) return null;
    setState('evaluating');
    const data = await voiceInterviewApi.end({ sessionId: session.sessionId });
    setReport(data.report);
    setState('completed');
    return data.report;
  };

  return { state, setState, session, setSession, feedback, report, history, error, setError, start, submitAnswer, end };
}
