const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'our',
  'that',
  'the',
  'their',
  'this',
  'to',
  'with',
  'will',
  'you',
  'your',
  'candidate',
  'developer',
  'experience',
  'need',
  'role',
  'team',
  'work',
  'working',
]);

const TECH_ALIASES = {
  js: 'javascript',
  'node js': 'node.js',
  nodejs: 'node.js',
  reactjs: 'react',
  'react js': 'react',
  expressjs: 'express',
  mongodb: 'mongoDB',
  mongo: 'mongoDB',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mysql: 'mysql',
  typescript: 'typescript',
  ts: 'typescript',
  tailwindcss: 'tailwind css',
  tailwind: 'tailwind css',
  nextjs: 'next.js',
  'next js': 'next.js',
  rest: 'rest api',
  restful: 'rest api',
};

const IMPORTANT_TERMS = [
  'javascript',
  'typescript',
  'react',
  'next.js',
  'node.js',
  'express',
  'python',
  'java',
  'spring boot',
  'html',
  'css',
  'tailwind css',
  'redux',
  'mongoDB',
  'mysql',
  'postgresql',
  'sql',
  'rest api',
  'graphql',
  'git',
  'github',
  'docker',
  'aws',
  'azure',
  'gcp',
  'firebase',
  'testing',
  'jest',
  'cypress',
  'api',
  'authentication',
  'responsive',
  'performance',
  'agile',
  'communication',
];

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w.+#\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonical(term) {
  const normalized = normalize(term).replace(/\s+/g, ' ').replace(/^[.+#-]+|[.+#-]+$/g, '');
  return TECH_ALIASES[normalized] || normalized;
}

function wordsFrom(text) {
  return normalize(text)
    .split(' ')
    .map((word) => canonical(word))
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function extractPhrases(text) {
  const normalized = normalize(text);
  const terms = new Set();

  IMPORTANT_TERMS.forEach((term) => {
    const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const pattern = new RegExp(`(^|[^a-z0-9.+#-])${escaped}($|[^a-z0-9.+#-])`);
    if (pattern.test(normalized)) {
      terms.add(canonical(term));
    }
  });

  wordsFrom(text).forEach((word) => terms.add(word));

  return [...terms];
}

function topTerms(terms, limit) {
  const seen = new Set();
  return terms
    .map(canonical)
    .filter((term) => {
      if (seen.has(term)) return false;
      seen.add(term);
      return true;
    })
    .slice(0, limit);
}

function sentenceCase(term) {
  if (term === 'mongoDB') return 'MongoDB';
  return term
    .split(' ')
    .map((part) => {
      if (['api', 'sql', 'aws', 'gcp'].includes(part)) return part.toUpperCase();
      if (part.includes('.')) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function buildSuggestions(missingKeywords, matchedKeywords, targetRole) {
  const suggestions = [];
  const missing = missingKeywords.slice(0, 6).map(sentenceCase);

  if (missing.length) {
    suggestions.push(`Add evidence for these job keywords if you have them: ${missing.join(', ')}.`);
  }

  if (matchedKeywords.length) {
    suggestions.push(`Move your strongest matching skills near the top: ${matchedKeywords.slice(0, 5).map(sentenceCase).join(', ')}.`);
  }

  suggestions.push(`Rewrite one project bullet to connect directly to the ${targetRole || 'target'} role.`);
  suggestions.push('Include measurable impact where possible, such as speed, users, accuracy, revenue, or time saved.');

  return suggestions;
}

export function matchJob({ skills, projects, experience, targetRole, jobDescription }) {
  const candidateText = [skills, projects, experience, targetRole].filter(Boolean).join(' ');
  const candidateTerms = new Set(extractPhrases(candidateText));
  const jobTerms = topTerms(extractPhrases(jobDescription), 30);

  const matchedKeywords = jobTerms.filter((term) => candidateTerms.has(term));
  const missingKeywords = jobTerms.filter((term) => !candidateTerms.has(term)).slice(0, 12);

  const weightedScore = jobTerms.length ? Math.round((matchedKeywords.length / jobTerms.length) * 100) : 0;
  const score = Math.max(0, Math.min(100, weightedScore));

  return {
    score,
    summary:
      score >= 75
        ? 'Strong match. Your profile already reflects many of the role requirements.'
        : score >= 45
          ? 'Moderate match. You have relevant overlap, but the profile should be tailored more closely.'
          : 'Low match. The job description contains several keywords not visible in your profile yet.',
    matchedKeywords: matchedKeywords.map(sentenceCase),
    missingKeywords: missingKeywords.map(sentenceCase),
    suggestions: buildSuggestions(missingKeywords, matchedKeywords, targetRole),
  };
}
