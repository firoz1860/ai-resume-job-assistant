export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="card-gradient p-6 group">
      <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
        {icon}
      </div>
      <h3 className="font-semibold text-ink mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}
