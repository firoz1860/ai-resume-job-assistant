import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import GeneratorForm from '../components/GeneratorForm.jsx';
import ResultCard from '../components/ResultCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { generateContent } from '../services/api.js';

const RATE_LIMIT_COOLDOWN = 30; // seconds to show countdown on 429

function ErrorPanel({ error, onRetry, isRateLimited }) {
  const [countdown, setCountdown] = useState(isRateLimited ? RATE_LIMIT_COOLDOWN : 0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isRateLimited) return;
    setCountdown(RATE_LIMIT_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRateLimited, error]);

  const canRetry = !isRateLimited || countdown === 0;

  return (
    <div className="p-5 animate-fade-in">
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${isRateLimited ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
        <svg className={`w-5 h-5 shrink-0 mt-0.5 ${isRateLimited ? 'text-amber-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${isRateLimited ? 'text-amber-800' : 'text-red-700'}`}>
            {isRateLimited ? 'Rate limit hit' : 'Generation failed'}
          </p>
          <p className={`text-xs mt-1 leading-relaxed ${isRateLimited ? 'text-amber-700' : 'text-red-600'}`}>
            {error}
          </p>
          {isRateLimited && countdown > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((RATE_LIMIT_COOLDOWN - countdown) / RATE_LIMIT_COOLDOWN) * 100}%` }}
                />
              </div>
              <span className="text-xs text-amber-600 font-medium tabular-nums shrink-0">{countdown}s</span>
            </div>
          )}
          <button
            onClick={onRetry}
            disabled={!canRetry}
            className={`mt-3 text-xs font-medium underline hover:no-underline disabled:opacity-40 disabled:cursor-not-allowed ${isRateLimited ? 'text-amber-700' : 'text-red-600'}`}
          >
            {canRetry ? 'Try again' : `Wait ${countdown}s…`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Generator() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  const handleGenerate = async (payload) => {
    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);
    setLastPayload(payload);
    try {
      const content = await generateContent(payload);
      setResult({ content, contentType: payload.contentType });
    } catch (err) {
      const msg = err.message || 'Something went wrong. Please try again.';
      const isRL = msg.toLowerCase().includes('rate limit');
      setError(msg);
      setIsRateLimited(isRL);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastPayload) handleGenerate(lastPayload);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <PageHeader
            icon="doc"
            eyebrow="AI content"
            title="Content Generator"
            subtitle="Fill in your details, choose content type and tone, then generate tailored, ready-to-send content."
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
            {/* Left: Form */}
            <div className="card p-5 sm:p-6">
              <GeneratorForm onSubmit={handleGenerate} isLoading={isLoading} />
            </div>

            {/* Right: Result */}
            <div className="lg:sticky lg:top-24">
              <div className="card min-h-[480px] flex flex-col">
                {error && !isLoading && (
                  <ErrorPanel error={error} onRetry={handleRegenerate} isRateLimited={isRateLimited} />
                )}
                {isLoading && <Loader />}
                {!isLoading && !error && result && (
                  <ResultCard
                    content={result.content}
                    contentType={result.contentType}
                    onRegenerate={handleRegenerate}
                    isLoading={isLoading}
                  />
                )}
                {!isLoading && !error && !result && <EmptyState />}
              </div>

              {!result && !isLoading && (
                <div className="mt-4 p-4 bg-accent/5 border border-accent/15 rounded-xl">
                  <p className="text-xs font-semibold text-accent mb-2">Pro tip</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Paste the actual job description for much better results. The AI uses it to tailor the language and highlight the most relevant parts of your background.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
