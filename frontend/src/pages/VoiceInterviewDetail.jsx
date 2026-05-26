import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import VoiceInterviewReport from '../components/voiceInterview/VoiceInterviewReport.jsx';
import { voiceInterviewApi } from '../services/api.js';

export default function VoiceInterviewDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  useEffect(() => { voiceInterviewApi.detail(id).then(setDetail).catch(() => setDetail(null)); }, [id]);
  return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6">
    <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-8">Voice Interview Detail</h1>
    {detail && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"><div className="card p-5 space-y-3">{detail.messages.map((message) => <div key={message._id} className="border-b border-border pb-3 last:border-b-0"><p className="text-xs text-muted uppercase">{message.role}</p><p className="text-sm text-ink">{message.question || message.transcript || message.feedback}</p>{message.score && <p className="text-sm font-bold text-accent">{message.score}/10</p>}</div>)}</div><VoiceInterviewReport report={detail.session.finalReport} /></div>}
  </div></main><Footer /></div>;
}
