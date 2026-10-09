import AIInterviewerAvatar from './AIInterviewerAvatar.jsx';
import SpeechControls from './SpeechControls.jsx';
import TranscriptBox from './TranscriptBox.jsx';
import VoiceFeedbackPanel from './VoiceFeedbackPanel.jsx';
import VoiceTimer from './VoiceTimer.jsx';
import { Icon } from '../Reveal.jsx';

export default function VoiceInterviewRoom({ secondsLeft, state, session, subtitle, transcript, interimTranscript, setTranscript, recognitionError, isListening, isSpeaking, feedback, history, onReplay, onAnswerNow, onStartListening, onStopListening, onReset, onSubmit, onSkip, onEnd }) {
  const busy = state === 'evaluating' || isSpeaking || state === 'ai_speaking';
  const canForceReady = state === 'ai_speaking' || isSpeaking;
  return <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-6 items-start min-w-0">
    <div className="space-y-4 min-w-0">
      <VoiceTimer secondsLeft={secondsLeft} />
      <AIInterviewerAvatar status={state} />
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-600">
            <Icon name="mic" className="w-4 h-4" />
            AI subtitle
          </p>
          <button onClick={onReplay} className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-600">
            <Icon name="history" className="w-3.5 h-3.5" />
            Replay AI voice
          </button>
        </div>
        <p className="text-base text-ink leading-relaxed">{subtitle || session.question}</p>
      </div>
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-sage-600 mb-2">Current question</p>
        <p className="text-sm text-ink leading-relaxed">{session.question}</p>
      </div>
      <div className="card p-4 bg-forest-50 border-forest-100">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-forest-700 mb-1">
          <Icon name="route" className="w-4 h-4" />
          How it works
        </p>
        <p className="text-sm text-sage-600 leading-relaxed">Listen to the AI question, read the subtitle, then click Start Answer and speak. You can edit the transcript before submitting.</p>
      </div>
    </div>
    <div className="space-y-4 min-w-0">
      <TranscriptBox transcript={transcript} interimTranscript={interimTranscript} onChange={setTranscript} error={recognitionError} />
      <SpeechControls isListening={isListening} disabled={busy} canForceReady={canForceReady} canSubmit={Boolean(transcript.trim())} onAnswerNow={onAnswerNow} onStart={onStartListening} onStop={onStopListening} onReset={onReset} onSubmit={onSubmit} onSkip={onSkip} onEnd={onEnd} />
      <VoiceFeedbackPanel feedback={feedback} />
      <div className="card p-4 sm:p-5 max-h-96 overflow-y-auto">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-600 mb-3">
          <Icon name="history" className="w-4 h-4" />
          Saved interview turns
        </p>
        {history.map((item, index) => (
          <div key={item.id || index} className="text-sm border-b border-border py-3 last:border-b-0 last:pb-0 space-y-2">
            <div>
              <p className="font-semibold text-ink">Q{index + 1}. AI asked</p>
              <p className="text-sage-600">{item.question}</p>
            </div>
            {item.transcript && (
              <div className="bg-surface border border-border rounded-card p-2.5">
                <p className="font-semibold text-ink">Your saved answer</p>
                <p className="text-sage-600">{item.transcript}</p>
              </div>
            )}
            {item.feedback && (
              <div className="bg-forest-50 border border-forest-100 rounded-card p-2.5">
                <p className="font-semibold text-forest-800">Evaluation {item.score ? `(${item.score}/10)` : ''}</p>
                <p className="text-forest-700">{item.feedback}</p>
                {item.mistakes?.length ? <p className="text-amber-700 mt-1">Mistakes: {item.mistakes.join(', ')}</p> : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>;
}
