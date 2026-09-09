import { useCallback, useEffect, useRef, useState } from 'react';

function splitSpeech(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean];
  const chunks = [];
  let current = '';

  sentences.forEach((sentence) => {
    const next = `${current} ${sentence}`.trim();
    if (next.length > 180 && current) {
      chunks.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

export default function useSpeechSynthesis({ rate = 1, pitch = 1, volume = 1 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [voices, setVoices] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const voicesRef = useRef([]);
  const queueRef = useRef([]);
  const onDoneRef = useRef(null);
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return undefined;

    const loadVoices = () => {
      const nextVoices = window.speechSynthesis.getVoices();
      voicesRef.current = nextVoices;
      setVoices(nextVoices);
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const preferredVoice = useCallback(() => {
    const available = voicesRef.current.length ? voicesRef.current : voices;
    return available.find((voice) => voice.lang?.startsWith('en') && /google|microsoft|natural|zira|female/i.test(voice.name))
      || available.find((voice) => voice.lang?.startsWith('en'))
      || available[0]
      || null;
  }, [voices]);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      window.clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (!isSupported) return;
    queueRef.current = [];
    onDoneRef.current = null;
    clearResumeTimer();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [clearResumeTimer, isSupported]);

  const speakNext = useCallback(() => {
    if (!isSupported) return;
    const chunk = queueRef.current.shift();

    if (!chunk) {
      clearResumeTimer();
      setIsSpeaking(false);
      const done = onDoneRef.current;
      onDoneRef.current = null;
      done?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.voice = preferredVoice();
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = speakNext;
    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') {
        return;
      }
      setError(event.error || 'Speech playback failed.');
      speakNext();
    };

    window.speechSynthesis.speak(utterance);
  }, [clearResumeTimer, isSupported, pitch, preferredVoice, rate, volume]);

  const speak = useCallback((text, onEnd) => {
    if (!isSupported || !text) {
      onEnd?.();
      return;
    }

    setError('');
    window.speechSynthesis.cancel();
    queueRef.current = splitSpeech(text);
    onDoneRef.current = onEnd;

    clearResumeTimer();
    resumeTimerRef.current = window.setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 8000);

    setIsSpeaking(true);
    window.setTimeout(speakNext, 50);
  }, [clearResumeTimer, isSupported, speakNext]);

  const unlock = useCallback((audible = false) => {
    if (!isSupported) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(audible ? 'Voice enabled. I will speak each question aloud.' : 'Voice enabled.');
      utterance.volume = audible ? volume : 0.02;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.voice = preferredVoice();
      utterance.onend = () => setIsUnlocked(true);
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          setIsUnlocked(false);
        }
      };
      window.speechSynthesis.speak(utterance);
      setIsUnlocked(true);
      return true;
    } catch {
      setError('Browser blocked voice playback. Click Enable Voice and allow sound.');
      return false;
    }
  }, [isSupported, pitch, preferredVoice, rate, volume]);

  const pause = useCallback(() => { if (isSupported) window.speechSynthesis.pause(); }, [isSupported]);
  const resume = useCallback(() => { if (isSupported) window.speechSynthesis.resume(); }, [isSupported]);

  // Self-clean on unmount: cancel any in-flight speech and clear the keep-alive
  // interval so it doesn't run forever (and no onend fires setState after unmount).
  useEffect(() => () => {
    clearResumeTimer();
    queueRef.current = [];
    onDoneRef.current = null;
    if (isSupported) window.speechSynthesis.cancel();
  }, [clearResumeTimer, isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    unlock,
    isSpeaking,
    isSupported,
    isUnlocked,
    voicesReady: voices.length > 0,
    error,
  };
}
