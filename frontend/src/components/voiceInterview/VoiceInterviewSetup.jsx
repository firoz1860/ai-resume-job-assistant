const types = ['HR Interview', 'Technical Interview', 'Project-Based Interview', 'DSA Theory Interview', 'System Design Interview', 'Mixed Interview'];

export default function VoiceInterviewSetup({ form, setForm, onStart, loading }) {
  const set = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  return <form onSubmit={onStart} className="card p-5 sm:p-6 space-y-4">
    <input name="targetRole" value={form.targetRole} onChange={set} placeholder="Target role" className="form-input" />
    <select name="interviewType" value={form.interviewType} onChange={set} className="form-select">{types.map((type) => <option key={type}>{type}</option>)}</select>
    <select name="difficulty" value={form.difficulty} onChange={set} className="form-select">{['Easy', 'Medium', 'Hard'].map((x) => <option key={x}>{x}</option>)}</select>
    <input name="skills" value={form.skills} onChange={set} placeholder="Skills" className="form-input" />
    <textarea name="projects" value={form.projects} onChange={set} rows={3} placeholder="Projects" className="form-textarea" />
    <textarea name="experience" value={form.experience} onChange={set} rows={3} placeholder="Experience" className="form-textarea" />
    <textarea name="jobDescription" value={form.jobDescription} onChange={set} rows={3} placeholder="Job description optional" className="form-textarea" />
    <div className="bg-accent/5 border border-accent/15 rounded-lg p-3 text-sm text-muted">Duration is fixed at 20 minutes. Browser voice input is used for transcripts.</div>
    <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Starting...' : 'Start 20-Minute Voice Interview'}</button>
  </form>;
}
