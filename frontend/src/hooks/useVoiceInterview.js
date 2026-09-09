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
    setState('starting');
    setError('');
    try {
      const data = await voiceInterviewApi.start(payload);
      setSession(data);
      setHistory([{ id: data.sessionId, question: data.question, transcript: '', feedback: null, score: null }]);
      setState('ai_speaking');
      return data;
    } catch (err) {
      setState('setup');
      setError(err.message || 'Unable to start voice interview.');
      throw err;
    }
  };

  const submitAnswer = async (transcript, speakingTimeSeconds) => {
    setState('evaluating'); setError('');
    try {
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
    } catch (err) {
      // Don't leave the UI stuck on 'evaluating'; let the user retry the answer.
      setState('waiting_for_answer');
      setError(err.message || 'Unable to evaluate answer. Please try again.');
      return null;
    }
  };

  const end = async () => {
    if (!session?.sessionId) return null;
    const previousState = state;
    setState('evaluating');
    try {
      const data = await voiceInterviewApi.end({ sessionId: session.sessionId });
      setReport(data.report);
      setState('completed');
      return data.report;
    } catch (err) {
      setState(previousState);
      setError(err.message || 'Unable to finish the interview. Please try again.');
      return null;
    }
  };

  return { state, setState, session, setSession, feedback, report, history, error, setError, start, submitAnswer, end };
}
