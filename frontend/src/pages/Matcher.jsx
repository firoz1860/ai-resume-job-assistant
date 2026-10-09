import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Loader from '../components/Loader.jsx';
import { Icon } from '../components/Reveal.jsx';
import { matchJob } from '../services/api.js';

const initialForm = {
  targetRole: '',
  skills: '',
  projects: '',
  experience: '',
  jobDescription: '',
};

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

function KeywordList({ title, items, tone }) {
  const color = tone === 'good' ? 'bg-forest-50 text-forest-700 border-border' : 'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <div>
      <p className="text-xs font-semibold text-sage-500 uppercase tracking-wide mb-2">{title}</p>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className={`px-2.5 py-1 rounded-lg border text-xs font-medium break-words ${color}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-sage-500">No keywords found yet.</p>
      )}
    </div>
  );
}

function StrategyList({ title, items, tone = 'neutral' }) {
  const colors = {
    neutral: 'bg-surface border-border text-ink',
    good: 'bg-forest-50 border-border text-forest-700',
    warn: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  return (
    <div>
      <p className="text-xs font-semibold text-sage-500 uppercase tracking-wide mb-2">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className={`text-sm border rounded-lg px-3 py-2 leading-relaxed ${colors[tone]}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StrategyPanel({ strategy }) {
  if (!strategy) return null;

  return (
    <div className="border-t border-border pt-5 space-y-5">
      <div>
        <p className="text-xs font-semibold text-sage-500 uppercase tracking-wide mb-2">Application Strategy</p>
        <p className="text-sm text-ink bg-surface border border-border rounded-card px-3 py-3 leading-relaxed">
          {strategy.positioning}
        </p>
      </div>

      <div className="bg-forest-50 border border-border rounded-card px-3 py-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 uppercase tracking-wide mb-1">
          <Icon name="bolt" className="w-3.5 h-3.5" />
          Best Next Content
        </p>
        <p className="text-sm font-semibold text-ink">{strategy.recommendedContent.contentType}</p>
        <p className="text-xs text-sage-600 mt-1 leading-relaxed">{strategy.recommendedContent.reason}</p>
      </div>

      <StrategyList title="Focus Plan" items={strategy.focusPlan} />
      <StrategyList title="Interview / Resume Talking Points" items={strategy.talkingPoints} tone="good" />
      <StrategyList title="Risk Areas" items={strategy.riskAreas} tone="warn" />
    </div>
  );
}

function MatchResult({ result }) {
  const scoreColor = result.score >= 75 ? 'text-forest-700' : result.score >= 45 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="card p-5 sm:p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink">Profile Match</h2>
          <p className="text-sm text-sage-600 mt-1">{result.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-3xl font-extrabold ${scoreColor}`}>{result.score}%</p>
          <p className="text-xs text-sage-500">profile match</p>
        </div>
      </div>
      <p className="text-xs text-sage-500 mb-4 leading-relaxed">
        Evidence-based overlap between your profile and this role — not a prediction of being hired.
      </p>

      <div className="h-2 bg-surface rounded-full overflow-hidden mb-6">
        <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${result.score}%` }} />
      </div>

      <div className="space-y-5">
        <KeywordList title="Supporting skills (found in your profile)" items={result.matchedKeywords} tone="good" />
        <KeywordList title="Missing evidence (not found yet)" items={result.missingKeywords} tone="warn" />

        <div>
          <p className="text-xs font-semibold text-sage-500 uppercase tracking-wide mb-2">Suggestions</p>
          <ul className="space-y-2">
            {result.suggestions.map((item) => (
              <li key={item} className="text-sm text-ink bg-surface border border-border rounded-card px-3 py-2 break-words">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <StrategyPanel strategy={result.strategy} />
      </div>
    </div>
  );
}

export default function Matcher() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    const nextErrors = {};
    if (!form.targetRole.trim()) nextErrors.targetRole = 'Target role is required.';
    if (!form.skills.trim()) nextErrors.skills = 'Skills are required.';
    if (!form.jobDescription.trim()) nextErrors.jobDescription = 'Job description is required.';
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await matchJob(form);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to analyze this job description.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <span className="eyebrow-pill mb-2">
              <Icon name="match" className="w-3.5 h-3.5 text-forest-700" />
              Matcher
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1.5">Job Description Matcher</h1>
            <p className="text-sage-600 text-sm">Compare your profile with a job post to see supporting skills and missing evidence before applying.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
            <form onSubmit={handleSubmit} noValidate className="card p-5 sm:p-6 space-y-4">
              <Field id="targetRole" label="Target Role" required error={errors.targetRole}>
                <input
                  id="targetRole"
                  name="targetRole"
                  value={form.targetRole}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  className={`form-input ${errors.targetRole ? 'border-red-400' : ''}`}
                />
              </Field>

              <Field id="skills" label="Your Skills" required error={errors.skills}>
                <input
                  id="skills"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, MongoDB, REST APIs"
                  className={`form-input ${errors.skills ? 'border-red-400' : ''}`}
                />
              </Field>

              <Field id="projects" label="Projects">
                <textarea
                  id="projects"
                  name="projects"
                  rows={3}
                  value={form.projects}
                  onChange={handleChange}
                  placeholder="Paste 1-2 project descriptions..."
                  className="form-textarea"
                />
              </Field>

              <Field id="experience" label="Experience">
                <textarea
                  id="experience"
                  name="experience"
                  rows={3}
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Paste internship/work experience or leave blank..."
                  className="form-textarea"
                />
              </Field>

              <Field id="jobDescription" label="Job Description" required error={errors.jobDescription}>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  rows={7}
                  value={form.jobDescription}
                  onChange={handleChange}
                  placeholder="Paste the full job description here..."
                  className={`form-textarea ${errors.jobDescription ? 'border-red-400' : ''}`}
                />
              </Field>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 justify-center text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? 'Analyzing...' : 'Analyze Match'}
              </button>
            </form>

            <div className="lg:sticky lg:top-24">
              {isLoading ? (
                <div className="card min-h-[420px] flex items-center justify-center">
                  <Loader message="Analyzing your match..." />
                </div>
              ) : result ? (
                <MatchResult result={result} />
              ) : (
                <div className="card min-h-[420px] p-6 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 rounded-card bg-forest-50 border border-border grid place-items-center mx-auto mb-4">
                    <Icon name="chart" className="w-6 h-6 text-forest-700" />
                  </div>
                  <h2 className="text-lg font-bold text-ink mb-2">Paste a job post</h2>
                  <p className="text-sm text-sage-600 leading-relaxed max-w-sm mx-auto">
                    The matcher will show supporting skills, missing evidence, and practical suggestions you can use before generating your resume summary, email, or cover letter.
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
