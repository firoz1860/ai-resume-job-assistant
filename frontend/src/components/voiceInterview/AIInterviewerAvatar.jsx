import VoiceWave from './VoiceWave.jsx';

export default function AIInterviewerAvatar({ status }) {
  const active = ['ai_speaking', 'listening', 'evaluating'].includes(status);
  return <div className="card p-6 text-center overflow-hidden relative">
    <div className="absolute inset-x-8 top-4 h-20 bg-accent/10 blur-2xl" />
    <div className="relative w-24 h-24 mx-auto rounded-full bg-navy-900 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
      <span className="text-3xl font-extrabold">AI</span>
    </div>
    <VoiceWave active={active} />
    <p className="text-sm font-semibold text-ink mt-3">{status.replaceAll('_', ' ')}</p>
  </div>;
}
