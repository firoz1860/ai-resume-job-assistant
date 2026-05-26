function format(seconds) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function VoiceTimer({ secondsLeft }) {
  return <div className="card px-4 py-3 text-2xl font-extrabold text-accent tabular-nums">{format(secondsLeft)}</div>;
}
