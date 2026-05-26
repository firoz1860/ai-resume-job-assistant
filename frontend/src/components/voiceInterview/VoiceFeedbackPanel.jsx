export default function VoiceFeedbackPanel({ feedback }) {
  if (!feedback) return null;
  return <div className="card p-4 space-y-3">
    <div className="flex items-center justify-between"><p className="font-bold text-ink">Feedback</p><span className="text-2xl font-extrabold text-accent">{feedback.score}/10</span></div>
    <p className="text-sm bg-surface border border-border rounded-lg p-3">{feedback.feedback}</p>
    <p className="text-sm bg-surface border border-border rounded-lg p-3">{feedback.betterAnswer}</p>
    <div className="flex flex-wrap gap-2">{(feedback.mistakes || []).map((item) => <span key={item} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-1">{item}</span>)}</div>
  </div>;
}
