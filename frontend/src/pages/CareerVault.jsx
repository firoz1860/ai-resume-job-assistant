import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { Icon } from '../components/Reveal.jsx';
import { careerVaultApi } from '../services/api.js';

const typeIcons = {
  Profile: 'users',
  Application: 'doc',
  'Generated Content': 'sparkle',
  Interview: 'mic',
  'Voice Interview': 'mic',
  Roadmap: 'route',
  'Job Analysis': 'shield',
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
          {/* ── Search hero: the primary interaction ───────────────────── */}
          <section className="panel bg-forest text-white p-6 sm:p-8 mb-6">
            <span className="eyebrow-pill bg-white/10 text-white/80 border-white/20 mb-3">
              <Icon name="history" className="h-3.5 w-3.5" />
              Career Vault
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Search your career memory</h1>
            <p className="text-white/75 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
              One search across saved profile proof, applications, generated content, interviews, job analyses, and roadmaps.
            </p>

            <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-700">
                  <Icon name="target" className="h-5 w-5" />
                </span>
                <label htmlFor="vault-search" className="sr-only">Search your career vault</label>
                <input
                  id="vault-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="form-input pl-11 h-12 text-base"
                  placeholder="Search skills, company, role, feedback..."
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="btn-lime px-6" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
                <button type="button" onClick={() => { setQuery(''); load(''); }} className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30">Reset</button>
              </div>
            </form>
          </section>

          {/* ── Summary metrics ─────────────────────────────────────────── */}
          {data?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                ['Vault items', data.summary.total, 'history'],
                ['Profile complete', `${data.summary.profileComplete}%`, 'users'],
                ['Applications', data.summary.applications, 'doc'],
                ['Interviews', data.summary.interviews, 'mic'],
              ].map(([label, value, icon]) => (
                <div key={label} className="card p-4">
                  <span className="w-8 h-8 rounded-card bg-forest-50 text-forest-700 grid place-items-center mb-2">
                    <Icon name={icon} className="h-4 w-4" />
                  </span>
                  <p className="text-xs text-sage-600">{label}</p>
                  <p className="text-2xl font-bold text-ink font-display">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Keyword quick-filters ───────────────────────────────────── */}
          {!!data?.keywords?.length && (
            <div className="card p-4 sm:p-5 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-600 mb-2.5">Top keywords</p>
              <div className="flex flex-wrap gap-2">
                {data.keywords.map((keyword) => (
                  <button
                    type="button"
                    key={keyword}
                    onClick={() => { setQuery(keyword); load(keyword); }}
                    className="badge bg-white border border-border text-ink hover:border-forest-300 hover:bg-forest-50 transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Results ─────────────────────────────────────────────────── */}
          <section className="space-y-5">
            {error && (
              <div role="alert" className="card p-5 border-red-200 bg-red-50">
                <p className="font-semibold text-red-700">Search failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button type="button" onClick={() => load(query)} className="btn-secondary mt-3 text-sm">Try again</button>
              </div>
            )}

            {loading && (
              <div className="card p-6">
                <div className="flex items-center gap-3 text-sm text-sage-600">
                  <span className="relative w-5 h-5 shrink-0">
                    <span className="absolute inset-0 rounded-full border-2 border-forest-100" />
                    <span className="absolute inset-0 rounded-full border-2 border-forest border-t-transparent animate-spin" />
                  </span>
                  Searching your saved workspace...
                </div>
              </div>
            )}

            {!loading && !error && data?.suggestions?.length > 0 && (
              <div className="card p-5 sm:p-6">
                <h2 className="flex items-center gap-2 font-semibold text-ink mb-3">
                  <Icon name="bolt" className="h-4 w-4 text-forest-700" />
                  Next data upgrades
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.suggestions.map((suggestion) => (
                    <div key={suggestion} className="bg-surface border border-border rounded-card p-3 text-sm text-sage-600">{suggestion}</div>
                  ))}
                </div>
              </div>
            )}

            {!loading && !error && data?.results?.length === 0 && (
              <div className="card p-10 text-center">
                <div className="w-14 h-14 rounded-panel bg-forest-50 grid place-items-center mx-auto mb-4"><Icon name="target" className="h-6 w-6 text-forest-700" /></div>
                <h3 className="font-semibold text-ink">{query.trim() ? 'No matching career data found' : 'Your vault is empty for now'}</h3>
                <p className="text-sm text-sage-600 mt-1 max-w-sm mx-auto">
                  {query.trim()
                    ? 'Try a company, role, skill, interview topic, or saved content type.'
                    : 'Save applications, interviews, generated content, and roadmaps and they will become searchable here.'}
                </p>
                {query.trim() && (
                  <button type="button" onClick={() => { setQuery(''); load(''); }} className="btn-secondary mt-4 text-sm">Clear search</button>
                )}
              </div>
            )}

            {!loading && !error && Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="flex items-center gap-2 font-semibold text-ink min-w-0">
                    <span className="w-8 h-8 rounded-card bg-forest-50 text-forest-700 grid place-items-center shrink-0">
                      <Icon name={typeIcons[type] || 'sparkle'} className="h-4 w-4" />
                    </span>
                    <span className="truncate">{type}</span>
                  </h2>
                  <span className="badge bg-forest-50 text-forest-700 border border-forest-100 shrink-0">{items.length} result{items.length === 1 ? '' : 's'}</span>
                </div>
                <div className="space-y-3">
                  {items.map((result) => (
                    <a key={result.id} href={result.href} className="group block border border-border rounded-card p-4 hover:border-forest-300 hover:bg-forest-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/30">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{result.title}</p>
                          <p className="text-sm text-sage-600 mt-1 line-clamp-3 whitespace-pre-wrap">{result.description || 'Saved career record'}</p>
                        </div>
                        <span className="badge bg-white text-sage-600 border border-border shrink-0">
                          <Icon name={typeIcons[type] || 'sparkle'} className="h-3.5 w-3.5" />
                          {type}
                        </span>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-forest-700">
                        View source
                        <Icon name="route" className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
