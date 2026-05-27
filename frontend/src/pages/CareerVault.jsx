import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { careerVaultApi } from '../services/api.js';

const typeStyles = {
  Profile: 'bg-blue-50 text-blue-700 border-blue-100',
  Application: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Generated Content': 'bg-violet-50 text-violet-700 border-violet-100',
  Interview: 'bg-amber-50 text-amber-700 border-amber-100',
  'Voice Interview': 'bg-sky-50 text-sky-700 border-sky-100',
  Roadmap: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Job Analysis': 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function CareerVault() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (search = query) => {
    setLoading(true);
    setError('');
    try {
      setData(await careerVaultApi.search(search));
    } catch (err) {
      setError(err.message || 'Unable to search Career Vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const grouped = useMemo(() => {
    const groups = {};
    (data?.results || []).forEach((item) => {
      groups[item.type] = groups[item.type] || [];
      groups[item.type].push(item);
    });
    return groups;
  }, [data]);

  const submit = (event) => {
    event.preventDefault();
    load(query);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
            <aside className="card p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Career Vault</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink">Search your career memory</h1>
              <p className="text-sm text-muted mt-3 leading-relaxed">
                Search saved profile proof, applications, generated content, interviews, job analyses, and roadmaps from one place.
              </p>

              <form onSubmit={submit} className="mt-5 space-y-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="form-input"
                  placeholder="Search skills, company, role, feedback..."
                />
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-primary text-sm" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
                  <button type="button" onClick={() => { setQuery(''); load(''); }} className="btn-secondary text-sm">Reset</button>
                </div>
              </form>

              {data?.summary && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    ['Vault Items', data.summary.total],
                    ['Profile', `${data.summary.profileComplete}%`],
                    ['Applications', data.summary.applications],
                    ['Interviews', data.summary.interviews],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-surface border border-border rounded-lg p-3">
                      <p className="text-xs text-muted">{label}</p>
                      <p className="text-xl font-extrabold text-navy-900">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {!!data?.keywords?.length && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-muted uppercase mb-2">Top Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {data.keywords.map((keyword) => (
                      <button
                        type="button"
                        key={keyword}
                        onClick={() => { setQuery(keyword); load(keyword); }}
                        className="px-2.5 py-1 rounded-full border border-border bg-white text-xs font-semibold text-ink hover:border-accent"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <section className="space-y-5">
              {error && <div className="card p-4 border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
              {loading && <div className="card p-8 text-sm text-muted">Searching your saved workspace...</div>}

              {!loading && !error && data?.suggestions?.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-bold text-ink mb-3">Next data upgrades</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.suggestions.map((suggestion) => (
                      <div key={suggestion} className="bg-surface border border-border rounded-lg p-3 text-sm text-muted">{suggestion}</div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && !error && data?.results?.length === 0 && (
                <div className="card p-8 text-center">
                  <p className="font-bold text-ink">No matching career data found</p>
                  <p className="text-sm text-muted mt-1">Try a company, role, skill, interview topic, or saved content type.</p>
                </div>
              )}

              {!loading && !error && Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="card p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="font-bold text-ink">{type}</h2>
                    <span className="text-xs text-muted">{items.length} result{items.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((result) => (
                      <a key={result.id} href={result.href} className="block border border-border rounded-lg p-4 hover:border-accent hover:bg-blue-50/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <p className="font-semibold text-ink">{result.title}</p>
                            <p className="text-sm text-muted mt-1 line-clamp-3 whitespace-pre-wrap">{result.description || 'Saved career record'}</p>
                          </div>
                          <span className={`text-xs font-semibold rounded-full border px-2.5 py-1 shrink-0 ${typeStyles[type] || 'bg-surface text-muted border-border'}`}>
                            {type}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
