export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 text-3xl">
        ✨
      </div>
      <h3 className="font-semibold text-ink mb-2">Your content will appear here</h3>
      <p className="text-muted text-sm max-w-xs leading-relaxed">
        Fill in your details on the left, choose a content type and tone, then hit Generate.
      </p>
    </div>
  );
}
