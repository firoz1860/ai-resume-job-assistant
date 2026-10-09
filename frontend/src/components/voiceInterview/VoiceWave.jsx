export default function VoiceWave({ active }) {
  return <div className="flex items-end justify-center gap-1.5 h-10" aria-hidden="true">{[1, 2, 3, 4, 5].map((bar) => <span key={bar} className={`w-1.5 rounded-full transition-colors duration-200 ${active ? 'bg-forest-600 animate-pulse' : 'bg-border'}`} style={{ height: `${12 + bar * 5}px` }} />)}</div>;
}
