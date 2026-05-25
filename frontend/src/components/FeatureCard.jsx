export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-6 hover:shadow-card-hover transition-shadow duration-200 group">
      <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="font-semibold text-ink mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}
