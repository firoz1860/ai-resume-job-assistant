import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { Icon } from '../components/Reveal.jsx';
import { voiceInterviewApi } from '../services/api.js';

export default function VoiceInterviewHistory() {
  const [items, setItems] = useState([]);
  useEffect(() => { voiceInterviewApi.history().then(setItems).catch(() => setItems([])); }, []);
  return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6">
    <div className="mb-8">
      <span className="eyebrow-pill mb-2"><Icon name="history" className="w-3.5 h-3.5" />Voice interviews</span>
      <h1 className="text-2xl sm:text-3xl font-bold text-ink">Voice Interview History</h1>
      <p className="text-sm text-sage-600 mt-1">Review your past voice sessions, scores, and feedback.</p>
    </div>
    {items.length === 0 ? (
      <div className="card p-10 sm:p-14 flex flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-forest-50 text-forest-700 mb-4"><Icon name="mic" className="w-7 h-7" /></span>
        <h2 className="font-semibold text-ink">No voice interviews yet</h2>
        <p className="text-sm text-sage-600 max-w-sm mt-1 leading-relaxed">Once you complete a voice interview, your sessions and scores will appear here.</p>
        <Link to="/voice-interview" className="btn-primary mt-5">Start a voice interview</Link>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.map((item) => <Link to={`/voice-interview/${item._id}`} key={item._id} className="card p-5 hover:shadow-card-hover hover:border-forest-200 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-ink truncate">{item.targetRole || 'Untitled role'}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="badge bg-surface border border-border text-sage-600">{item.interviewType}</span>
              <span className="badge bg-surface border border-border text-sage-600">{item.difficulty}</span>
            </div>
          </div>
          {item.status && <span className="badge bg-forest-50 text-forest-700 capitalize shrink-0">{item.status}</span>}
        </div>
        {item.overallScore != null ? (
          <p className="mt-4"><span className="text-3xl font-extrabold text-forest-700 tabular-nums">{item.overallScore}</span><span className="text-sm text-sage-600"> / 100</span></p>
        ) : (
          <p className="mt-4 text-sm text-sage-600">Not scored yet</p>
        )}
      </Link>)}</div>
    )}
  </div></main><Footer /></div>;
}
