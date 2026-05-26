export default function VoiceInterviewReport({ report }) {
  if (!report) return null;
  return <div className="card p-5 sm:p-6 space-y-5">
    <div><p className="text-xs text-muted uppercase font-semibold">Voice Interview Report</p><p className="text-5xl font-extrabold text-accent">{report.overallScore}</p></div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{['communicationScore', 'technicalScore', 'problemSolvingScore', 'confidenceScore', 'clarityScore'].map((key) => <div key={key} className="bg-surface border border-border rounded-lg p-3"><p className="text-xs text-muted">{key.replace(/([A-Z])/g, ' $1')}</p><p className="text-xl font-bold text-ink">{report[key]}/10</p></div>)}</div>
    {['strengths', 'weaknesses', 'improvementPlan', 'recommendedPracticeTopics'].map((key) => <div key={key}><p className="text-xs text-muted uppercase font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1')}</p><div className="space-y-2">{(report[key] || []).map((item) => <p key={item} className="text-sm bg-surface border border-border rounded-lg p-2">{item}</p>)}</div></div>)}
    <p className="text-sm bg-accent/5 border border-accent/15 rounded-lg p-3">{report.finalVerdict}</p>
  </div>;
}
