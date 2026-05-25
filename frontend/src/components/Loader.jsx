export default function Loader({ message = 'Generating your content...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
      </div>
      <p className="text-muted text-sm font-medium">{message}</p>
    </div>
  );
}
