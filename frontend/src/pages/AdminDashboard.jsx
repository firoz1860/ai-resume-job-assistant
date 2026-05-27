import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { adminApi } from '../services/api.js';

function Metric({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="text-3xl font-extrabold text-ink mt-2">{value}</p>
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
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Admin</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">CareerOS AI platform metrics</h1>
            <p className="text-sm text-muted mt-1">Live metrics from users, generated assets, interviews, applications, and target roles.</p>
          </div>

          {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {!stats && !error && <div className="card p-8 text-sm text-muted">Loading metrics...</div>}

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

              <section className="card p-5">
                <h2 className="font-bold text-ink mb-4">Most common target roles</h2>
                <div className="space-y-3">
                  {(stats.commonTargetRoles || []).length === 0 && <p className="text-sm text-muted">No role data yet. Complete interviews or save applications to populate this view.</p>}
                  {(stats.commonTargetRoles || []).map((item) => (
                    <div key={item.role} className="flex items-center justify-between gap-3 bg-surface border border-border rounded-lg p-3">
                      <span className="font-semibold text-ink">{item.role}</span>
                      <span className="text-sm text-muted">{item.count}</span>
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

