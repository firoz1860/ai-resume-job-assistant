import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import { Icon } from '../components/Reveal.jsx';
import { adminApi } from '../services/api.js';

function Metric({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">{label}</p>
      <p className="text-3xl font-extrabold text-ink mt-2 font-display">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch((err) => setError(err.message || 'Unable to load admin metrics.'));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <PageHeader
            icon="shield"
            eyebrow="Admin"
            title="CareerOS platform metrics"
            subtitle="Live metrics from users, generated assets, interviews, applications, and target roles."
          />

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" role="alert">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-secondary text-sm px-4 py-2 shrink-0">Retry</button>
            </div>
          )}

          {!stats && !error && (
            <div className="card">
              <Loader message="Loading metrics..." />
            </div>
          )}

          {stats && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Metric label="Total users" value={stats.totalUsers} />
                <Metric label="Generated content" value={stats.generatedContent} />
                <Metric label="Completed interviews" value={stats.interviewsCompleted} />
                <Metric label="Tracked applications" value={stats.trackedApplications} />
                <Metric label="Resume versions" value={stats.resumeVersions} />
                <Metric label="Average score" value={`${stats.averageScore}%`} />
              </div>

              <section className="card p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="chart" className="w-5 h-5 text-forest-700" />
                  <h2 className="font-bold text-ink">Most common target roles</h2>
                </div>
                <div className="space-y-3">
                  {(stats.commonTargetRoles || []).length === 0 && <p className="text-sm text-sage-600 bg-surface border border-border rounded-card p-3">No role data yet. Complete interviews or save applications to populate this view.</p>}
                  {(stats.commonTargetRoles || []).map((item) => (
                    <div key={item.role} className="flex items-center justify-between gap-3 bg-surface border border-border rounded-card p-3">
                      <span className="font-semibold text-ink">{item.role}</span>
                      <span className="badge bg-forest-50 text-forest-700 border border-forest-100">{item.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
