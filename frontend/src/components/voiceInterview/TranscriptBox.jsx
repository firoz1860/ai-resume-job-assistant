export default function TranscriptBox({ transcript, interimTranscript, onChange, error }) {
  return <div className="card p-4 sm:p-5">
    <div className="flex items-center justify-between gap-2 mb-2">
      <label htmlFor="voice-transcript" className="form-label mb-0">Live transcript</label>
      <span className="text-xs text-sage-600">Editable</span>
    </div>
    <textarea
      id="voice-transcript"
      value={`${transcript}${interimTranscript ? ` ${interimTranscript}` : ''}`}
      onChange={(e) => onChange(e.target.value)}
      rows={7}
      placeholder="Your spoken answer will appear here — you can edit it before submitting…"
      className="form-textarea"
    />
    {error ? (
      <p role="alert" className="text-xs text-red-600 mt-2">{error}</p>
    ) : (
      <p className="text-xs text-sage-600 mt-2">Tip: review and tidy the text before you submit.</p>
    )}
  </div>;
}
