export default function VoicePermissionModal({ isSupported }) {
  if (isSupported) return null;
  return <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">Speech recognition is not supported in this browser. Use Chrome or Edge for voice input.</div>;
}
