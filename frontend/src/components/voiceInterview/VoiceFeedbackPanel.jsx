export default function VoiceFeedbackPanel({ feedback }) {
  if (!feedback) return null;
  const metrics = feedback.audioMetrics;
  return <div className="card p-4 sm:p-5 space-y-3">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Answer feedback</p>
      <span className="badge bg-forest-50 text-forest-700 text-base">{feedback.score}/10</span>
    </div>
    {metrics && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          ['Speed', `${metrics.speakingSpeedWpm} wpm`],
          ['Pauses', metrics.pauseCount],
          ['Fillers', metrics.fillerCount],
          ['Confidence', `${metrics.confidenceScore}/10`],
          ['STAR', `${metrics.starScore}/10`],
          ['Structure', `${metrics.structureScore}/10`],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface border border-border rounded-card p-2">
            <p className="text-[10px] font-bold uppercase text-sage-600">{label}</p>
            <p className="text-sm font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
    )}
    <p className="text-sm text-ink bg-surface border border-border rounded-card p-3 leading-relaxed">{feedback.feedback}</p>
    {feedback.betterAnswer && (
      <div className="text-sm bg-forest-50 border border-forest-100 rounded-card p-3">
        <p className="text-[10px] font-bold uppercase text-forest-700 mb-1">Stronger answer</p>
        <p className="text-ink leading-relaxed">{feedback.betterAnswer}</p>
      </div>
    )}
    {(feedback.mistakes || []).length > 0 && (
      <div className="flex flex-wrap gap-2">{(feedback.mistakes || []).map((item) => <span key={item} className="badge bg-amber-50 text-amber-700 border border-amber-200">{item}</span>)}</div>
    )}
  </div>;
}
