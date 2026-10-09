import { Icon } from '../Reveal.jsx';

const types = ['HR Interview', 'Technical Interview', 'Project-Based Interview', 'DSA Theory Interview', 'System Design Interview', 'Mixed Interview'];

export default function VoiceInterviewSetup({ form, setForm, onStart, loading }) {
  const set = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  return <form onSubmit={onStart} className="card p-5 sm:p-6 space-y-4 max-w-2xl">
    <div className="mb-1">
      <span className="eyebrow-pill mb-2"><Icon name="mic" className="w-3.5 h-3.5" />Set up your session</span>
      <p className="text-sm text-sage-600">Tell the interviewer about the role and your background to tailor the questions.</p>
    </div>

    <div>
      <label htmlFor="v-targetRole" className="form-label">Target role</label>
      <input id="v-targetRole" name="targetRole" value={form.targetRole} onChange={set} placeholder="e.g. Frontend Engineer" className="form-input" required />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="v-interviewType" className="form-label">Interview type</label>
        <select id="v-interviewType" name="interviewType" value={form.interviewType} onChange={set} className="form-select">{types.map((type) => <option key={type}>{type}</option>)}</select>
      </div>
      <div>
        <label htmlFor="v-difficulty" className="form-label">Difficulty</label>
        <select id="v-difficulty" name="difficulty" value={form.difficulty} onChange={set} className="form-select">{['Easy', 'Medium', 'Hard'].map((x) => <option key={x}>{x}</option>)}</select>
      </div>
    </div>
    <div>
      <label htmlFor="v-skills" className="form-label">Skills</label>
      <input id="v-skills" name="skills" value={form.skills} onChange={set} placeholder="e.g. React, Node.js, SQL" className="form-input" />
    </div>
    <div>
      <label htmlFor="v-projects" className="form-label">Projects</label>
      <textarea id="v-projects" name="projects" value={form.projects} onChange={set} rows={3} placeholder="Briefly describe notable projects" className="form-textarea" />
    </div>
    <div>
      <label htmlFor="v-experience" className="form-label">Experience</label>
      <textarea id="v-experience" name="experience" value={form.experience} onChange={set} rows={3} placeholder="Summarise your experience" className="form-textarea" />
    </div>
    <div>
      <label htmlFor="v-jobDescription" className="form-label">Job description <span className="font-normal text-sage-600">(optional)</span></label>
      <textarea id="v-jobDescription" name="jobDescription" value={form.jobDescription} onChange={set} rows={3} placeholder="Paste the job description to focus the questions" className="form-textarea" />
    </div>

    <div className="flex items-start gap-2 bg-forest-50 border border-forest-100 rounded-card p-3 text-sm text-sage-600">
      <Icon name="shield" className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
      <span>Duration is fixed at 20 minutes. Browser voice input is used for transcripts — your microphone is requested only when you start answering.</span>
    </div>
    <button className="btn-primary w-full justify-center" disabled={loading}>
      {loading ? 'Starting…' : 'Start 20-minute voice interview'}
    </button>
  </form>;
}
