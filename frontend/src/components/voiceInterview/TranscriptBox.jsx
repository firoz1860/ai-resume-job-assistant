export default function TranscriptBox({ transcript, interimTranscript, onChange, error }) {
  return <div>
    <label className="form-label">Live Transcript</label>
    <textarea value={`${transcript}${interimTranscript ? ` ${interimTranscript}` : ''}`} onChange={(e) => onChange(e.target.value)} rows={7} placeholder="Your spoken answer will appear here..." className="form-textarea" />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>;
}
