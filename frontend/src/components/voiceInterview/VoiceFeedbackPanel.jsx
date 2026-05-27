export default function VoiceFeedbackPanel({ feedback }) {
  if (!feedback) return null;
  const metrics = feedback.audioMetrics;
  return <div className="card p-4 space-y-3">
    <div className="flex items-center justify-between"><p className="font-bold text-ink">Feedback</p><span className="text-2xl font-extrabold text-accent">{feedback.score}/10</span></div>
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
          <div key={label} className="bg-surface border border-border rounded-lg p-2">
            <p className="text-[10px] font-bold uppercase text-muted">{label}</p>
            <p className="text-sm font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
    )}
    <p className="text-sm bg-surface border border-border rounded-lg p-3">{feedback.feedback}</p>
    <p className="text-sm bg-surface border border-border rounded-lg p-3">{feedback.betterAnswer}</p>
    <div className="flex flex-wrap gap-2">{(feedback.mistakes || []).map((item) => <span key={item} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-1">{item}</span>)}</div>
  </div>;
}
