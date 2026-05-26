export default function VoiceWave({ active }) {
  return <div className="flex items-end justify-center gap-1 h-10">{[1, 2, 3, 4, 5].map((bar) => <span key={bar} className={`w-1.5 rounded-full bg-accent ${active ? 'animate-pulse' : 'opacity-30'}`} style={{ height: `${12 + bar * 5}px` }} />)}</div>;
}
