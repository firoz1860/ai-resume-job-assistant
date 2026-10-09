import { Icon } from '../Reveal.jsx';

function format(seconds) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function VoiceTimer({ secondsLeft }) {
  const low = secondsLeft <= 60;
  return <div className="card px-4 py-3 flex items-center justify-between gap-3">
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-600">
      <Icon name="history" className="w-4 h-4" />
      Time left
    </span>
    <span className={`text-2xl font-extrabold tabular-nums ${low ? 'text-red-600' : 'text-forest-700'}`}>{format(secondsLeft)}</span>
  </div>;
}
