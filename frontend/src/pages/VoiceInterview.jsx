import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import VoiceInterviewSetup from '../components/voiceInterview/VoiceInterviewSetup.jsx';
import VoiceInterviewRoom from '../components/voiceInterview/VoiceInterviewRoom.jsx';
import VoiceInterviewReport from '../components/voiceInterview/VoiceInterviewReport.jsx';
import VoicePermissionModal from '../components/voiceInterview/VoicePermissionModal.jsx';
import useCountdownTimer from '../hooks/useCountdownTimer.js';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import useVoiceInterview from '../hooks/useVoiceInterview.js';

const initialForm = { targetRole: '', interviewType: 'Mixed Interview', difficulty: 'Medium', skills: '', projects: '', experience: '', jobDescription: '' };

export default function VoiceInterview() {
  const [form, setForm] = useState(initialForm);
  const [muted, setMuted] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const readyTimerRef = useRef(null);
  const voice = useVoiceInterview();
  const speech = useSpeechSynthesis({ rate: 0.95 });
  const recognition = useSpeechRecognition();
  const timer = useCountdownTimer(voice.session?.timeRemaining || 1200, Boolean(voice.session && voice.state !== 'completed'), () => voice.end());
  const { speak, stop: stopSpeaking, unlock: unlockSpeech } = speech;

  const markReadyAfterSpeech = useCallback((text, nextState) => {
    if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
    const estimatedMs = Math.min(18000, Math.max(3500, String(text).split(/\s+/).length * 430));
    readyTimerRef.current = window.setTimeout(() => {
      voice.setState(nextState);
    }, estimatedMs);
  }, [voice]);

  const speakOut = useCallback((text, nextState = 'waiting_for_answer') => {
    setSubtitle(text);
    setLastSpokenText(text);
    if (muted) {
      voice.setState(nextState);
      return;
    }
    voice.setState('ai_speaking');
    markReadyAfterSpeech(text, nextState);
    speak(text, () => {
      if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
      voice.setState(nextState);
    });
  }, [markReadyAfterSpeech, muted, speak, voice]);

  const speakQuestion = useCallback((question) => {
    if (!question) return;
    setSubtitle(question);
    setLastSpokenText(question);
    if (muted) {
      voice.setState('waiting_for_answer');
      return;
    }
    voice.setState('ai_speaking');
    markReadyAfterSpeech(question, 'waiting_for_answer');
    speak(question, () => {
      if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
      voice.setState('waiting_for_answer');
    });
  }, [markReadyAfterSpeech, muted, speak, voice]);

  const start = async (e) => {
    e.preventDefault();
    unlockSpeech(false);
    const data = await voice.start(form);
    timer.setSecondsLeft(data.timeRemaining || 1200);
    speakQuestion(data.question);
  };

  const submit = async () => {
    const transcript = recognition.transcript.trim();
    if (!transcript) {
      voice.setError('Transcript is empty. Please speak or type your answer.');
      return;
    }
    const data = await voice.submitAnswer(transcript, 0);
    recognition.resetTranscript();
    const spokenFeedback = data.shortSpokenFeedback || `Your score is ${data.score} out of 10. Here is the next question.`;
    setSubtitle(spokenFeedback);
    if (!muted) {
      voice.setState('ai_speaking');
      speak(spokenFeedback, () => speakQuestion(data.nextQuestion));
    } else {
      speakQuestion(data.nextQuestion);
    }
  };

  const skip = async () => {
    recognition.setTranscript('I would like to skip this question.');
    const data = await voice.submitAnswer('I would like to skip this question.', 0);
    recognition.resetTranscript();
    const spokenFeedback = data.shortSpokenFeedback || `Skipping noted. Here is the next question.`;
    setSubtitle(spokenFeedback);
    if (!muted) {
      voice.setState('ai_speaking');
      speak(spokenFeedback, () => speakQuestion(data.nextQuestion));
    } else {
      speakQuestion(data.nextQuestion);
    }
  };

  const end = async () => {
    if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
    stopSpeaking();
    recognition.stopListening();
    await voice.end();
  };

  const answerNow = () => {
    if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
    stopSpeaking();
    voice.setState('waiting_for_answer');
  };

  const toggleMute = () => {
    setMuted((current) => {
      const next = !current;
      if (next) {
        stopSpeaking();
        if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
        if (voice.state === 'ai_speaking') voice.setState('waiting_for_answer');
      } else if (lastSpokenText) {
        window.setTimeout(() => speakOut(lastSpokenText), 0);
      }
      return next;
    });
  };

  const replay = () => {
    if (!lastSpokenText) return;
    speakOut(lastSpokenText);
  };

  useEffect(() => () => {
    if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
    stopSpeaking();
  }, [stopSpeaking]);

  return <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div><h1 className="text-2xl sm:text-3xl font-bold text-ink">AI Voice Interview Room</h1><p className="text-sm text-muted mt-1">Speak answers, get feedback, and continue for a 20-minute real interview.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
            <button onClick={() => unlockSpeech(true)} className="btn-primary">Enable Voice</button>
            <button onClick={toggleMute} className="btn-secondary">{muted ? 'Unmute AI' : 'Mute AI'}</button>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-lg border px-3 py-2 text-xs ${speech.isSupported ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>Speaker: {speech.isSupported ? 'Supported' : 'Not supported'}</div>
          <div className={`rounded-lg border px-3 py-2 text-xs ${muted ? 'bg-slate-50 border-slate-200 text-slate-700' : speech.isUnlocked ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>Voice: {muted ? 'Muted' : speech.isUnlocked ? 'Enabled' : 'Click Enable Voice'}</div>
          <div className={`rounded-lg border px-3 py-2 text-xs ${recognition.isSupported ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>Microphone: {recognition.isSupported ? 'Supported' : 'Use Chrome or Edge'}</div>
        </div>
        <VoicePermissionModal isSupported={recognition.isSupported} />
        {voice.error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{voice.error}</div>}
        {speech.error && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">{speech.error} Use the Replay AI Voice button or check browser sound permissions.</div>}
        {voice.state === 'setup' || voice.state === 'starting' ? <VoiceInterviewSetup form={form} setForm={setForm} onStart={start} loading={voice.state === 'starting'} /> : null}
        {voice.session && voice.state !== 'completed' ? <VoiceInterviewRoom secondsLeft={timer.secondsLeft} state={voice.state} session={voice.session} subtitle={subtitle} transcript={recognition.transcript} interimTranscript={recognition.interimTranscript} setTranscript={recognition.setTranscript} recognitionError={recognition.error} isListening={recognition.isListening} isSpeaking={speech.isSpeaking} feedback={voice.feedback} history={voice.history} onReplay={replay} onAnswerNow={answerNow} onStartListening={() => { voice.setState('listening'); recognition.startListening(); }} onStopListening={() => { recognition.stopListening(); voice.setState('waiting_for_answer'); }} onReset={recognition.resetTranscript} onSubmit={submit} onSkip={skip} onEnd={end} /> : null}
        {voice.state === 'completed' ? <VoiceInterviewReport report={voice.report} /> : null}
      </div>
    </main>
    <Footer />
  </div>;
}
