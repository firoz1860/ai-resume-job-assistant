import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { contentApi } from '../services/api.js';

export default function ContentLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await contentApi.list());
    } catch (err) {
      setError(err.message || 'Unable to load content library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content || '');
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(''), 1200);
    } catch {
      setError('Could not copy to clipboard. Copy manually instead.');
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await contentApi.remove(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete this item.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">Content Library</h1>
              <p className="text-sm text-muted">Saved AI outputs from your generator, tied to your account.</p>
            </div>
            <button onClick={load} className="btn-secondary text-sm justify-center">Refresh</button>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="card p-5 animate-pulse">
                  <div className="h-4 w-40 bg-border rounded mb-4" />
                  <div className="h-3 w-full bg-border rounded mb-2" />
                  <div className="h-3 w-5/6 bg-border rounded mb-2" />
                  <div className="h-3 w-3/4 bg-border rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="card p-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="card p-8 text-center">
              <p className="font-semibold text-ink">No saved content yet</p>
              <p className="text-sm text-muted mt-1">Generate content while logged in and it will appear here.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <article key={item.id} className="card p-5 flex flex-col min-h-[260px]">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-bold text-ink">{item.contentType || 'Generated Content'}</p>
                      <p className="text-xs text-muted">
                        {item.tone || 'Default tone'}
                        {item.createdAt ? ` - ${new Date(item.createdAt).toLocaleString()}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-accent bg-accent/10 rounded-full px-2.5 py-1 shrink-0">
                      Saved
                    </span>
                  </div>
                  <div className="text-sm text-muted whitespace-pre-wrap leading-relaxed flex-1 max-h-56 overflow-auto pr-1">
                    {item.content}
                  </div>
                  <div className="flex gap-2 mt-5">
                    <button onClick={() => copy(item)} className="btn-primary text-sm px-4 py-2">
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={() => remove(item.id)} className="btn-secondary text-sm px-4 py-2">
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
