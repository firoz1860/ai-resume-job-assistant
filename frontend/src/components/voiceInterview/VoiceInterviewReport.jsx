import { Icon } from '../Reveal.jsx';

const SECTION_META = {
  strengths: { title: 'Strengths', icon: 'check', item: 'bg-forest-50 border-forest-100 text-ink' },
  weaknesses: { title: 'Areas to improve', icon: 'target', item: 'bg-amber-50 border-amber-200 text-amber-900' },
  improvementPlan: { title: 'Improvement plan', icon: 'route', item: 'bg-surface border-border text-ink' },
  recommendedPracticeTopics: { title: 'Recommended practice topics', icon: 'sparkle', item: 'bg-surface border-border text-ink' },
};

export default function VoiceInterviewReport({ report }) {
  if (!report) return null;
  return <div className="card p-5 sm:p-6 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <span className="eyebrow-pill mb-2"><Icon name="chart" className="w-3.5 h-3.5" />Voice interview report</span>
        <p className="text-sm text-sage-600">Overall performance across this session</p>
      </div>
      <div className="text-right">
        <p className="text-5xl font-extrabold text-forest-700 tabular-nums leading-none">{report.overallScore}</p>
        <p className="text-xs text-sage-600 mt-1">out of 100</p>
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {['communicationScore', 'technicalScore', 'problemSolvingScore', 'confidenceScore', 'clarityScore'].map((key) => (
        <div key={key} className="bg-surface border border-border rounded-card p-3">
          <p className="text-xs text-sage-600 capitalize">{key.replace(/Score$/, '').replace(/([A-Z])/g, ' $1')}</p>
          <p className="text-xl font-bold text-ink">{report[key]}/10</p>
        </div>
      ))}
    </div>

    {['strengths', 'weaknesses', 'improvementPlan', 'recommendedPracticeTopics'].map((key) => {
      const meta = SECTION_META[key];
      return (
        <div key={key}>
          <p className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
            <Icon name={meta.icon} className="w-4 h-4 text-forest-600" />
            {meta.title}
          </p>
          <div className="space-y-2">{(report[key] || []).map((item) => <p key={item} className={`text-sm border rounded-card p-2.5 leading-relaxed ${meta.item}`}>{item}</p>)}</div>
        </div>
      );
    })}

    {report.finalVerdict && <p className="text-sm text-ink bg-lime-50 border border-lime-200 rounded-card p-3 leading-relaxed">{report.finalVerdict}</p>}
  </div>;
}
