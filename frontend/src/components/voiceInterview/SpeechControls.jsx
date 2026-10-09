import { Icon } from '../Reveal.jsx';

export default function SpeechControls({ isListening, disabled, onStart, onStop, onReset, onSubmit, onSkip, onEnd, onAnswerNow, canSubmit, canForceReady }) {
  return <div className="space-y-2">
    {canForceReady && (
      <button onClick={onAnswerNow} className="btn-lime w-full justify-center">
        <Icon name="bolt" className="w-4 h-4" />
        Answer Now
      </button>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button onClick={onStart} disabled={disabled || isListening} className="btn-primary justify-center" aria-pressed={isListening}>
        <Icon name="mic" className="w-4 h-4" />
        {isListening ? 'Listening…' : 'Start Answer'}
      </button>
      <button onClick={onStop} disabled={!isListening} className="btn-secondary justify-center">Stop Listening</button>
      <button onClick={onReset} className="btn-secondary justify-center">Reset Answer</button>
      <button onClick={onSubmit} disabled={disabled || !canSubmit} className="btn-primary justify-center">
        <Icon name="check" className="w-4 h-4" />
        Submit Answer
      </button>
      <button onClick={onSkip} disabled={disabled} className="btn-secondary justify-center">Skip Question</button>
      <button onClick={onEnd} className="btn-secondary justify-center text-red-600 hover:border-red-200 hover:bg-red-50">End Interview</button>
    </div>
  </div>;
}
