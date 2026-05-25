import { useState } from 'react';
import { CONTENT_TYPES, TONES, CONTENT_TYPE_DESCRIPTIONS } from '../utils/constants.js';

const initialState = {
  fullName: '',
  education: '',
  skills: '',
  projects: '',
  experience: '',
  targetRole: '',
  companyName: '',
  jobDescription: '',
  contentType: 'Resume Summary',
  tone: 'Professional',
};

// Defined outside GeneratorForm so its identity is stable across re-renders.
// If defined inside, React treats it as a new component type on every keystroke
// and unmounts/remounts the input, causing focus loss after each character.
function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function GeneratorForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.education.trim()) errs.education = 'Education is required.';
    if (!form.skills.trim()) errs.skills = 'Skills are required.';
    if (!form.targetRole.trim()) errs.targetRole = 'Target role is required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Content type + tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="contentType" label="Content Type" required>
          <select name="contentType" id="contentType" value={form.contentType} onChange={handleChange} className="form-select">
            {CONTENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted">{CONTENT_TYPE_DESCRIPTIONS[form.contentType]}</p>
        </Field>
        <Field id="tone" label="Tone">
          <select name="tone" id="tone" value={form.tone} onChange={handleChange} className="form-select">
            {TONES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Your Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="fullName" label="Full Name" required error={errors.fullName}>
            <input
              id="fullName" name="fullName" type="text"
              value={form.fullName} onChange={handleChange}
              placeholder="e.g. Arjun Sharma"
              className={`form-input ${errors.fullName ? 'border-red-400' : ''}`}
            />
          </Field>
          <Field id="targetRole" label="Target Role" required error={errors.targetRole}>
            <input
              id="targetRole" name="targetRole" type="text"
              value={form.targetRole} onChange={handleChange}
              placeholder="e.g. Frontend Developer"
              className={`form-input ${errors.targetRole ? 'border-red-400' : ''}`}
            />
          </Field>
        </div>
      </div>

      <Field id="education" label="Education" required error={errors.education}>
        <input
          id="education" name="education" type="text"
          value={form.education} onChange={handleChange}
          placeholder="e.g. B.Tech CSE, VIT University (2024)"
          className={`form-input ${errors.education ? 'border-red-400' : ''}`}
        />
      </Field>

      <Field id="skills" label="Skills" required error={errors.skills}>
        <input
          id="skills" name="skills" type="text"
          value={form.skills} onChange={handleChange}
          placeholder="e.g. React, Node.js, Python, MongoDB, Git"
          className={`form-input ${errors.skills ? 'border-red-400' : ''}`}
        />
      </Field>

      <Field id="projects" label="Projects">
        <textarea
          id="projects" name="projects" rows={3}
          value={form.projects} onChange={handleChange}
          placeholder="e.g. Built a real-time chat app using Socket.io and React; reduced load time by 40%..."
          className="form-textarea"
        />
      </Field>

      <Field id="experience" label="Work Experience">
        <textarea
          id="experience" name="experience" rows={2}
          value={form.experience} onChange={handleChange}
          placeholder="e.g. SDE Intern at Infosys (6 months) — worked on REST APIs; or leave blank if fresher"
          className="form-textarea"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="companyName" label="Target Company">
          <input
            id="companyName" name="companyName" type="text"
            value={form.companyName} onChange={handleChange}
            placeholder="e.g. Google, Swiggy, Startup X"
            className="form-input"
          />
        </Field>
      </div>

      <Field id="jobDescription" label="Job Description">
        <textarea
          id="jobDescription" name="jobDescription" rows={3}
          value={form.jobDescription} onChange={handleChange}
          placeholder="Paste the job description here for better tailoring..."
          className="form-textarea"
        />
      </Field>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-3 justify-center text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Generating...
          </>
        ) : (
          <>
            Generate Content
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
