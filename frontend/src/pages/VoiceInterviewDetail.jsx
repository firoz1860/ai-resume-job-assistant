import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { Icon } from '../components/Reveal.jsx';
import VoiceInterviewReport from '../components/voiceInterview/VoiceInterviewReport.jsx';
import { voiceInterviewApi } from '../services/api.js';

export default function VoiceInterviewDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    voiceInterviewApi.detail(id)
      .then((data) => { if (active) setDetail(data); })
      .catch((err) => { if (active) setError(err.message || 'Could not load this interview session.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const messages = detail?.messages || [];
  const report = detail?.session?.finalReport;

  return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <Link to="/voice-interview-history" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-600 mb-2"><Icon name="route" className="w-4 h-4 rotate-180" />Back to history</Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Voice Interview Detail</h1>
        <p className="text-sm text-sage-600 mt-1">The full transcript and feedback for this session.</p>
      </div>

      {loading && (
        <div className="card p-10 sm:p-14 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-50 text-forest-700 mb-4 animate-pulse"><Icon name="history" className="w-6 h-6" /></span>
          <p className="text-sm text-sage-600">Loading interview details…</p>
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="card p-6 border-red-200 bg-red-50">
          <p className="flex items-center gap-2 font-semibold text-red-700"><Icon name="shield" className="h-4 w-4" />Could not load this session</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <Link to="/voice-interview-history" className="btn-secondary text-sm mt-4">Back to history</Link>
        </div>
      )}

      {!loading && !error && detail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="card p-5 sm:p-6 space-y-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-600"><Icon name="doc" className="w-4 h-4" />Transcript</p>
            {messages.length ? messages.map((message) => (
              <div key={message._id} className="border-b border-border pb-4 last:border-b-0 last:pb-0 space-y-1.5">
                <span className="badge bg-surface border border-border text-sage-600 capitalize">{message.role}</span>
                <p className="text-sm text-ink leading-relaxed">{message.question || message.transcript || message.feedback}</p>
                {message.score != null && <span className="badge bg-forest-50 text-forest-700">{message.score}/10</span>}
                {message.audioMetrics && <p className="text-xs text-sage-600 mt-1">Speed {message.audioMetrics.speakingSpeedWpm} wpm · Fillers {message.audioMetrics.fillerCount} · STAR {message.audioMetrics.starScore}/10</p>}
              </div>
            )) : <p className="text-sm text-sage-600">No transcript recorded for this session.</p>}
          </div>
          {report ? <VoiceInterviewReport report={report} /> : (
            <div className="card p-6"><p className="text-sm text-sage-600">No final report is available for this session.</p></div>
          )}
        </div>
      )}
    </div></main><Footer /></div>
  );
}
