import { Icon } from '../Reveal.jsx';

export default function VoicePermissionModal({ isSupported }) {
  if (isSupported) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-4 flex items-start gap-3 rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
        <Icon name="mic" className="h-5 w-5" />
      </span>
      <div>
        <p className="font-semibold text-amber-900">Voice input isn’t available in this browser</p>
        <p className="mt-0.5 leading-relaxed">Speech recognition is required for the voice interview. Please use Google Chrome or Microsoft Edge to speak your answers.</p>
      </div>
    </div>
  );
}
