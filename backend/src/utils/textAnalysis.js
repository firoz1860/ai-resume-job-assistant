const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with', 'you',
  'your', 'role', 'team', 'work', 'working', 'candidate', 'experience',
]);

const SKILL_TERMS = [
  'javascript', 'typescript', 'react', 'next.js', 'node.js', 'express', 'python',
  'java', 'spring boot', 'html', 'css', 'tailwind', 'mongodb', 'mysql',
  'postgresql', 'sql', 'rest api', 'graphql', 'git', 'docker', 'aws', 'testing',
  'jest', 'cypress', 'authentication', 'responsive', 'performance', 'agile',
  'communication', 'system design', 'dsa', 'data structures',
];

export function normalizeText(text = '') {
  return text.toLowerCase().replace(/[^\w.+#\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractKeywords(text = '', limit = 18) {
  const normalized = normalizeText(text);
  const terms = new Set();

  SKILL_TERMS.forEach((term) => {
    const pattern = new RegExp(`(^|\\W)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}($|\\W)`, 'i');
    if (pattern.test(normalized)) terms.add(term);
  });

  normalized.split(' ')
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .forEach((word) => terms.add(word));

  return [...terms].slice(0, limit);
}

export function titleCase(value) {
  return value.split(' ').map((part) => {
    if (['api', 'sql', 'aws', 'dsa'].includes(part)) return part.toUpperCase();
    if (part.includes('.')) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' ');
}

export function overlapScore(sourceText, targetText) {
  const source = new Set(extractKeywords(sourceText, 40));
  const target = extractKeywords(targetText, 40);
  const matched = target.filter((term) => source.has(term));
  const missing = target.filter((term) => !source.has(term));
  const score = target.length ? Math.round((matched.length / target.length) * 100) : 0;

  return {
    score: Math.max(0, Math.min(100, score)),
    matched: matched.map(titleCase),
    missing: missing.slice(0, 12).map(titleCase),
    targetKeywords: target.slice(0, 18).map(titleCase),
  };
}
