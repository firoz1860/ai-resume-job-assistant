import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { interviewApi } from '../services/api.js';

export default function InterviewHistory() {
  const [items, setItems] = useState([]);
  useEffect(() => { interviewApi.history().then(setItems).catch(() => setItems([])); }, []);
  return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6">
    <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-8">Interview History</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.map((item) => <div key={item._id} className="card p-5"><p className="font-bold text-ink">{item.targetRole}</p><p className="text-sm text-muted">{item.interviewType} • {item.difficulty}</p><p className="text-3xl font-extrabold text-accent mt-3">{item.overallScore || 0}</p><p className="text-xs text-muted">{item.status}</p></div>)}</div>
  </div></main><Footer /></div>;
}
