import { extractKeywords } from './textAnalysis.js';

const SECTION_ALIASES = {
  summary: ['summary', 'profile', 'objective', 'professional summary'],
  skills: ['skills', 'technical skills', 'core skills', 'technologies'],
  education: ['education', 'academic', 'academics', 'qualification'],
  projects: ['projects', 'project work', 'personal projects'],
  experience: ['experience', 'work experience', 'professional experience', 'internship', 'internships'],
  links: ['links', 'profiles', 'portfolio', 'github', 'linkedin'],
  certifications: ['certifications', 'certificates'],
  achievements: ['achievements', 'awards'],
};

function normalizeLine(line = '') {
  return String(line).replace(/\s+/g, ' ').trim();
}

function sectionFor(line) {
  const cleaned = normalizeLine(line).replace(/[:\-]+$/g, '').toLowerCase();
  return Object.entries(SECTION_ALIASES).find(([, aliases]) => aliases.includes(cleaned))?.[0] || '';
}

export function parseResumeText(text = '') {
  const lines = String(text)
    .replace(/\r/g, '\n')
    .split('\n')
    .map(normalizeLine)
    .filter(Boolean);

  const sections = {
    summary: '',
    skills: '',
    education: '',
    projects: '',
    experience: '',
    links: '',
    certifications: '',
    achievements: '',
  };

  let current = 'summary';
  for (const line of lines) {
    const nextSection = sectionFor(line);
    if (nextSection) {
      current = nextSection;
      continue;
    }

    if (/https?:\/\/|github\.com|linkedin\.com|portfolio/i.test(line)) {
      sections.links += `${line}\n`;
      continue;
    }

    sections[current] += `${line}\n`;
  }

  Object.keys(sections).forEach((key) => {
    sections[key] = sections[key].trim();
  });

  const summary = sections.summary || lines.slice(0, 4).join(' ');
  const skills = sections.skills || extractKeywords(text, 20).join(', ');

  return {
    rawText: String(text).trim(),
    summary,
    skills,
    education: sections.education,
    projects: sections.projects,
    experience: sections.experience,
    links: sections.links,
    certifications: sections.certifications,
    achievements: sections.achievements,
    keywords: extractKeywords(text, 24),
    completeness: Math.round((Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100),
  };
}

export function buildResumeDiff(original = '', improved = '') {
  const before = new Set(extractKeywords(original, 50).map((item) => item.toLowerCase()));
  const after = extractKeywords(improved, 50);
  const added = after.filter((item) => !before.has(item.toLowerCase())).slice(0, 12);

  return {
    original,
    improved,
    keywordsAdded: added,
    reason: added.length
      ? `Improved bullet adds ${added.length} role-relevant keyword${added.length === 1 ? '' : 's'} and stronger evidence.`
      : 'Review impact, metrics, and action verbs before accepting this change.',
  };
}

