import AIInterviewerAvatar from './AIInterviewerAvatar.jsx';
import SpeechControls from './SpeechControls.jsx';
import TranscriptBox from './TranscriptBox.jsx';
import VoiceFeedbackPanel from './VoiceFeedbackPanel.jsx';
import VoiceTimer from './VoiceTimer.jsx';

export default function VoiceInterviewRoom({ secondsLeft, state, session, subtitle, transcript, interimTranscript, setTranscript, recognitionError, isListening, isSpeaking, feedback, history, onReplay, onAnswerNow, onStartListening, onStopListening, onReset, onSubmit, onSkip, onEnd }) {
  const busy = state === 'evaluating' || isSpeaking || state === 'ai_speaking';
  const canForceReady = state === 'ai_speaking' || isSpeaking;
  return <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
    <div className="space-y-4">
      <VoiceTimer secondsLeft={secondsLeft} />
      <AIInterviewerAvatar status={state} />
      <div className="card p-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-xs text-muted uppercase font-semibold">AI Subtitle</p>
          <button onClick={onReplay} className="text-xs font-semibold text-accent">Replay AI Voice</button>
        </div>
        <p className="text-base text-ink leading-relaxed">{subtitle || session.question}</p>
      </div>
      <div className="card p-5">
        <p className="text-xs text-muted uppercase font-semibold mb-2">Current Question Text</p>
        <p className="text-sm text-ink leading-relaxed">{session.question}</p>
      </div>
      <div className="card p-4 bg-accent/5 border-accent/15">
        <p className="text-xs text-accent uppercase font-semibold mb-1">Flow</p>
        <p className="text-sm text-muted">Listen to the AI question, read the subtitle, then click Start Answer and speak. You can edit the transcript before submitting.</p>
      </div>
    </div>
    <div className="space-y-4">
      <TranscriptBox transcript={transcript} interimTranscript={interimTranscript} onChange={setTranscript} error={recognitionError} />
      <SpeechControls isListening={isListening} disabled={busy} canForceReady={canForceReady} canSubmit={Boolean(transcript.trim())} onAnswerNow={onAnswerNow} onStart={onStartListening} onStop={onStopListening} onReset={onReset} onSubmit={onSubmit} onSkip={onSkip} onEnd={onEnd} />
      <VoiceFeedbackPanel feedback={feedback} />
      <div className="card p-4 max-h-96 overflow-y-auto">
        <p className="text-xs text-muted uppercase font-semibold mb-3">Saved Interview Turns</p>
        {history.map((item, index) => (
          <div key={item.id || index} className="text-sm border-b border-border py-3 last:border-b-0 space-y-2">
            <div>
              <p className="font-semibold text-ink">Q{index + 1}. AI asked</p>
              <p className="text-muted">{item.question}</p>
            </div>
            {item.transcript && (
              <div className="bg-surface border border-border rounded-lg p-2">
                <p className="font-semibold text-ink">Your saved answer</p>
                <p className="text-muted">{item.transcript}</p>
              </div>
            )}
            {item.feedback && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                <p className="font-semibold text-emerald-800">Evaluation {item.score ? `(${item.score}/10)` : ''}</p>
                <p className="text-emerald-700">{item.feedback}</p>
                {item.mistakes?.length ? <p className="text-amber-700 mt-1">Mistakes: {item.mistakes.join(', ')}</p> : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>;
}
