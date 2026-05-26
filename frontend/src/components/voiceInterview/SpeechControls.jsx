export default function SpeechControls({ isListening, disabled, onStart, onStop, onReset, onSubmit, onSkip, onEnd, onAnswerNow, canSubmit, canForceReady }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
    {canForceReady && <button onClick={onAnswerNow} className="btn-secondary text-accent">Answer Now</button>}
    <button onClick={onStart} disabled={disabled || isListening} className="btn-primary">Start Answer</button>
    <button onClick={onStop} disabled={!isListening} className="btn-secondary">Stop Listening</button>
    <button onClick={onReset} className="btn-secondary">Reset Answer</button>
    <button onClick={onSubmit} disabled={disabled || !canSubmit} className="btn-primary">Submit Answer</button>
    <button onClick={onSkip} disabled={disabled} className="btn-secondary">Skip Question</button>
    <button onClick={onEnd} className="btn-secondary text-red-600">End Interview</button>
  </div>;
}
