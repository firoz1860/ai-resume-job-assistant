import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { interviewApi } from '../services/api.js';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function Report({ report }) {
  if (!report) return null;
  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <div><p className="text-xs text-muted uppercase font-semibold">Overall Score</p><p className="text-5xl font-extrabold text-accent">{report.overallScore}</p></div>
      <div className="grid grid-cols-2 gap-3">
        {['communicationScore', 'technicalScore', 'problemSolvingScore', 'confidenceScore'].map((key) => <div key={key} className="bg-surface border border-border rounded-lg p-3"><p className="text-xs text-muted">{key.replace(/([A-Z])/g, ' $1')}</p><p className="text-xl font-bold text-ink">{report[key]}/10</p></div>)}
      </div>
      {['strengths', 'weaknesses', 'improvementPlan'].map((key) => <div key={key}><p className="text-xs text-muted uppercase font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1')}</p><div className="space-y-2">{(report[key] || []).map((item) => <p key={item} className="text-sm bg-surface border border-border rounded-lg p-2">{item}</p>)}</div></div>)}
      <p className="text-sm bg-accent/5 border border-accent/15 rounded-lg p-3">{report.finalVerdict}</p>
    </div>
  );
}

export default function InterviewRoom() {
  const [setup, setSetup] = useState({ targetRole: '', interviewType: 'HR Interview', difficulty: 'Easy', skills: '', projects: '', experience: '', jobDescription: '', durationMinutes: 10 });
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [report, setReport] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const endedRef = useRef(false);

  const set = (e) => setSetup((s) => ({ ...s, [e.target.name]: e.target.value }));

  const endInterview = async () => {
    if (!session?.sessionId || endedRef.current) return;
    endedRef.current = true;
    setLoading(true);
    try {
      const data = await interviewApi.end({ sessionId: session.sessionId });
      setReport(data.report);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || report) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          endInterview();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, report]);

  const start = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    setReport(null);
    endedRef.current = false;
    try {
      const data = await interviewApi.start(setup);
      setSession({ ...data, question: data.firstQuestion });
      setTimeLeft(data.timeRemaining || setup.durationMinutes * 60);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const data = await interviewApi.answer({ sessionId: session.sessionId, answer });
      setFeedback(data);
      setSession((s) => ({ ...s, question: data.nextQuestion }));
      setTimeLeft(data.timeRemaining);
      setAnswer('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">10-Minute AI Interview Room</h1>
              <p className="text-sm text-muted">One question at a time, answer feedback, timer, and final report.</p>
            </div>
            {session && <div className="card px-4 py-3 text-2xl font-extrabold text-accent tabular-nums w-full sm:w-auto text-center">{formatTime(timeLeft)}</div>}
          </div>

          {report ? <Report report={report} /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {!session && (
                <form onSubmit={start} className="card p-5 sm:p-6 space-y-4">
                  <input name="targetRole" value={setup.targetRole} onChange={set} placeholder="Target role" className="form-input" />
                  <select name="interviewType" value={setup.interviewType} onChange={set} className="form-select">{['HR Interview', 'Technical Interview', 'Project-Based Interview', 'DSA Theory Interview', 'System Design Interview', 'Mixed Interview'].map((x) => <option key={x}>{x}</option>)}</select>
                  <select name="difficulty" value={setup.difficulty} onChange={set} className="form-select">{['Easy', 'Medium', 'Hard'].map((x) => <option key={x}>{x}</option>)}</select>
                  <input name="skills" value={setup.skills} onChange={set} placeholder="Skills" className="form-input" />
                  <textarea name="projects" value={setup.projects} onChange={set} rows={3} placeholder="Projects" className="form-textarea" />
                  <textarea name="experience" value={setup.experience} onChange={set} rows={3} placeholder="Experience" className="form-textarea" />
                  <textarea name="jobDescription" value={setup.jobDescription} onChange={set} rows={3} placeholder="Job description optional" className="form-textarea" />
                  <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Starting...' : 'Start 10-Min Interview'}</button>
                </form>
              )}

              <div className={`card p-5 sm:p-6 space-y-4 ${session ? 'lg:col-span-2' : ''}`}>
                {session ? (
                  <>
                    <div className="bg-navy-900 text-white rounded-lg p-4">
                      <p className="text-xs text-white/60 uppercase font-semibold mb-2">AI Question</p>
                      <p className="text-base leading-relaxed">{session.question}</p>
                    </div>
                    <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} placeholder="Type your answer..." className="form-textarea" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={submitAnswer} className="btn-primary justify-center" disabled={loading || !answer.trim()}>{loading ? 'Evaluating...' : 'Submit Answer'}</button>
                      <button onClick={endInterview} className="btn-secondary justify-center" disabled={loading}>End Interview</button>
                    </div>
                  </>
                ) : <p className="text-sm text-muted">Configure the interview to begin.</p>}

                {feedback && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-3xl font-extrabold text-accent">{feedback.score}/10</p>
                    <p className="text-sm bg-surface border border-border rounded-lg p-3">{feedback.feedback}</p>
                    <p className="text-sm bg-surface border border-border rounded-lg p-3">{feedback.betterAnswer}</p>
                    <div className="flex flex-wrap gap-2">{(feedback.mistakes || []).map((m) => <span key={m} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-1">{m}</span>)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
