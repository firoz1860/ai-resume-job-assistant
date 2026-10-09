import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { Icon } from '../components/Reveal.jsx';
import { interviewApi } from '../services/api.js';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function Report({ report }) {
  if (!report) return null;
  const sections = {
    strengths: { title: 'Strengths', icon: 'check', item: 'bg-forest-50 border-forest-100 text-ink' },
    weaknesses: { title: 'Areas to improve', icon: 'target', item: 'bg-amber-50 border-amber-200 text-amber-900' },
    improvementPlan: { title: 'Improvement plan', icon: 'route', item: 'bg-surface border-border text-ink' },
  };
  return (
    <div className="card p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="eyebrow-pill mb-2"><Icon name="chart" className="w-3.5 h-3.5" />Interview report</span>
          <p className="text-sm text-sage-600">Your overall performance this session</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-extrabold text-forest-700 tabular-nums leading-none">{report.overallScore}</p>
          <p className="text-xs text-sage-600 mt-1">out of 100</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['communicationScore', 'technicalScore', 'problemSolvingScore', 'confidenceScore'].map((key) => <div key={key} className="bg-surface border border-border rounded-card p-3"><p className="text-xs text-sage-600 capitalize">{key.replace(/Score$/, '').replace(/([A-Z])/g, ' $1')}</p><p className="text-xl font-bold text-ink">{report[key]}/10</p></div>)}
      </div>
      {['strengths', 'weaknesses', 'improvementPlan'].map((key) => <div key={key}><p className="flex items-center gap-2 text-sm font-semibold text-ink mb-2"><Icon name={sections[key].icon} className="w-4 h-4 text-forest-600" />{sections[key].title}</p><div className="space-y-2">{(report[key] || []).map((item) => <p key={item} className={`text-sm border rounded-card p-2.5 leading-relaxed ${sections[key].item}`}>{item}</p>)}</div></div>)}
      {report.finalVerdict && <p className="text-sm text-ink bg-lime-50 border border-lime-200 rounded-card p-3 leading-relaxed">{report.finalVerdict}</p>}
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
  const [error, setError] = useState('');
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
    } catch (err) {
      setError(err.message || 'Could not end the interview. Please try again.');
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
    setError('');
    endedRef.current = false;
    try {
      const data = await interviewApi.start(setup);
      setSession({ ...data, question: data.firstQuestion });
      setTimeLeft(data.timeRemaining || setup.durationMinutes * 60);
    } catch (err) {
      setError(err.message || 'Could not start the interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await interviewApi.answer({ sessionId: session.sessionId, answer });
      setFeedback(data);
      setSession((s) => ({ ...s, question: data.nextQuestion }));
      setTimeLeft(data.timeRemaining);
      setAnswer('');
    } catch (err) {
      setError(err.message || 'Could not submit your answer. Please try again.');
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
              <span className="eyebrow-pill mb-2"><Icon name="doc" className="w-3.5 h-3.5" />Text interview</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">10-Minute AI Interview Room</h1>
              <p className="text-sm text-sage-600">One question at a time with per-answer feedback, a timer, and a final report.</p>
            </div>
            {session && (
              <div className="card px-4 py-3 flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-600"><Icon name="history" className="w-4 h-4" />Time left</span>
                <span className={`text-2xl font-extrabold tabular-nums ${timeLeft <= 60 ? 'text-red-600' : 'text-forest-700'}`}>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {error && <div role="alert" className="mb-6 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {report ? <Report report={report} /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {!session && (
                <form onSubmit={start} className="card p-5 sm:p-6 space-y-4">
                  <div>
                    <span className="eyebrow-pill mb-2"><Icon name="target" className="w-3.5 h-3.5" />Set up your session</span>
                    <p className="text-sm text-sage-600">Add a few details so the questions fit the role.</p>
                  </div>
                  <div>
                    <label htmlFor="t-targetRole" className="form-label">Target role</label>
                    <input id="t-targetRole" name="targetRole" value={setup.targetRole} onChange={set} placeholder="e.g. Backend Engineer" className="form-input" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="t-interviewType" className="form-label">Interview type</label>
                      <select id="t-interviewType" name="interviewType" value={setup.interviewType} onChange={set} className="form-select">{['HR Interview', 'Technical Interview', 'Project-Based Interview', 'DSA Theory Interview', 'System Design Interview', 'Mixed Interview'].map((x) => <option key={x}>{x}</option>)}</select>
                    </div>
                    <div>
                      <label htmlFor="t-difficulty" className="form-label">Difficulty</label>
                      <select id="t-difficulty" name="difficulty" value={setup.difficulty} onChange={set} className="form-select">{['Easy', 'Medium', 'Hard'].map((x) => <option key={x}>{x}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="t-skills" className="form-label">Skills</label>
                    <input id="t-skills" name="skills" value={setup.skills} onChange={set} placeholder="e.g. Python, SQL, AWS" className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="t-projects" className="form-label">Projects</label>
                    <textarea id="t-projects" name="projects" value={setup.projects} onChange={set} rows={3} placeholder="Briefly describe notable projects" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="t-experience" className="form-label">Experience</label>
                    <textarea id="t-experience" name="experience" value={setup.experience} onChange={set} rows={3} placeholder="Summarise your experience" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="t-jobDescription" className="form-label">Job description <span className="font-normal text-sage-600">(optional)</span></label>
                    <textarea id="t-jobDescription" name="jobDescription" value={setup.jobDescription} onChange={set} rows={3} placeholder="Paste the job description to focus the questions" className="form-textarea" />
                  </div>
                  <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Starting…' : 'Start 10-minute interview'}</button>
                </form>
              )}

              <div className={`card p-5 sm:p-6 space-y-4 ${session ? 'lg:col-span-2' : ''}`}>
                {session ? (
                  <>
                    <div className="bg-forest text-white rounded-card p-4">
                      <p className="flex items-center gap-2 text-xs text-lime uppercase font-semibold mb-2"><Icon name="sparkle" className="w-3.5 h-3.5" />AI question</p>
                      <p className="text-base leading-relaxed">{session.question}</p>
                    </div>
                    <div>
                      <label htmlFor="t-answer" className="form-label">Your answer</label>
                      <textarea id="t-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} placeholder="Type your answer…" className="form-textarea" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={submitAnswer} className="btn-primary justify-center" disabled={loading || !answer.trim()}><Icon name="check" className="w-4 h-4" />{loading ? 'Evaluating…' : 'Submit answer'}</button>
                      <button onClick={endInterview} className="btn-secondary justify-center text-red-600 hover:border-red-200 hover:bg-red-50" disabled={loading}>End interview</button>
                    </div>
                  </>
                ) : <p className="text-sm text-sage-600">Configure the interview on the left to begin.</p>}

                {feedback && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Answer feedback</p>
                      <span className="badge bg-forest-50 text-forest-700 text-base">{feedback.score}/10</span>
                    </div>
                    <p className="text-sm text-ink bg-surface border border-border rounded-card p-3 leading-relaxed">{feedback.feedback}</p>
                    {feedback.betterAnswer && (
                      <div className="text-sm bg-forest-50 border border-forest-100 rounded-card p-3">
                        <p className="text-[10px] font-bold uppercase text-forest-700 mb-1">Stronger answer</p>
                        <p className="text-ink leading-relaxed">{feedback.betterAnswer}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">{(feedback.mistakes || []).map((m) => <span key={m} className="badge bg-amber-50 text-amber-700 border border-amber-200">{m}</span>)}</div>
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
