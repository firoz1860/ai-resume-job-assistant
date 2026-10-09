import VoiceWave from './VoiceWave.jsx';

const STATUS_META = {
  ai_speaking: { label: 'Speaking', hint: 'The interviewer is asking a question', ring: 'ring-forest-300', badge: 'bg-forest-50 text-forest-700' },
  listening: { label: 'Listening', hint: 'Recording your answer', ring: 'ring-lime', badge: 'bg-lime text-forest-800' },
  evaluating: { label: 'Processing', hint: 'Scoring your answer', ring: 'ring-forest-300', badge: 'bg-forest-50 text-forest-700' },
  waiting_for_answer: { label: 'Your turn', hint: 'Click Start Answer when you are ready', ring: 'ring-border', badge: 'bg-white border border-border text-sage-600' },
  feedback: { label: 'Feedback ready', hint: 'Review, then continue', ring: 'ring-border', badge: 'bg-white border border-border text-sage-600' },
};

export default function AIInterviewerAvatar({ status }) {
  const active = ['ai_speaking', 'listening', 'evaluating'].includes(status);
  const meta = STATUS_META[status] || { label: status.replaceAll('_', ' '), hint: '', ring: 'ring-border', badge: 'bg-white border border-border text-sage-600' };
  return <div className="card p-6 text-center">
    <div className={`relative w-24 h-24 mx-auto rounded-full bg-forest text-white flex items-center justify-center mb-4 ring-4 ring-offset-2 ring-offset-card transition-all duration-300 ${meta.ring} ${active ? 'shadow-glow' : ''}`}>
      <span className="text-2xl font-extrabold tracking-wide">AI</span>
    </div>
    <VoiceWave active={active} />
    <span className={`badge mt-3 ${meta.badge}`}>{meta.label}</span>
    {meta.hint && <p className="text-xs text-sage-600 mt-2 leading-relaxed">{meta.hint}</p>}
  </div>;
}
