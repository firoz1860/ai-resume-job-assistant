import { useCallback, useEffect, useRef, useState } from 'react';

export default function useSpeechRecognition() {
  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const [isSupported] = useState(Boolean(Recognition));
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    // Stop any previous recognizer so two instances don't run concurrently.
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => { setIsListening(true); setError(''); };
    recognition.onerror = (event) => { setError(event.error || 'Microphone error.'); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      if (finalText) setTranscript((current) => `${current} ${finalText}`.trim());
      setInterimTranscript(interimText);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [Recognition]);

  const stopListening = useCallback(() => recognitionRef.current?.stop(), []);
  const resetTranscript = useCallback(() => { setTranscript(''); setInterimTranscript(''); setError(''); }, []);

  // On unmount, detach handlers (so they don't setState after unmount) and stop.
  useEffect(() => () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onstart = null;
      try { recognition.stop(); } catch { /* already stopped */ }
    }
    recognitionRef.current = null;
  }, []);

  return { startListening, stopListening, resetTranscript, setTranscript, transcript, interimTranscript, isListening, error, isSupported };
}
