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

function formatList(items, fallback) {
  return items.length ? items.slice(0, 4).map(sentenceCase).join(', ') : fallback;
}

function pickRecommendation(score, matchedKeywords, missingKeywords) {
  if (score >= 75) {
    return {
      contentType: 'Cold Email',
      reason: 'The match is already strong, so outreach should quickly communicate fit and ask for a conversation.',
    };
  }

  if (score >= 45) {
    return {
      contentType: 'Cover Letter',
      reason: 'The match is moderate, so a cover letter can connect existing strengths to the role and address gaps.',
    };
  }

  if (matchedKeywords.length >= 2 && missingKeywords.length <= 8) {
    return {
      contentType: 'Resume Summary',
      reason: 'The profile has some useful overlap, but the first resume section needs stronger positioning.',
    };
  }

  return {
    contentType: 'Project Explanation',
    reason: 'The profile needs stronger proof. Start by converting projects into role-relevant evidence.',
  };
}

function buildStrategy({ score, matchedKeywords, missingKeywords, targetRole, skills, projects, experience }) {
  const primaryStrengths = formatList(matchedKeywords, 'your strongest relevant skills');
  const topGaps = formatList(missingKeywords, 'the missing job keywords');
  const hasExperience = Boolean(experience?.trim());
  const hasProjects = Boolean(projects?.trim());
  const recommendation = pickRecommendation(score, matchedKeywords, missingKeywords);

  const positioning =
    score >= 75
      ? `Position yourself as a direct-fit ${targetRole} candidate. Lead with ${primaryStrengths}, then use projects or experience as proof.`
      : score >= 45
        ? `Position yourself as a close-fit ${targetRole} candidate with clear growth potential. Lead with ${primaryStrengths}, then proactively cover gaps around ${topGaps}.`
        : `Position yourself as an emerging ${targetRole} candidate. Do not oversell; instead, lead with transferable skills, strongest projects, and a clear plan to close gaps around ${topGaps}.`;

  const focusPlan = [
    matchedKeywords.length
      ? `Lead with: ${primaryStrengths}.`
      : `Lead with the most role-relevant parts of your skills: ${skills || 'your technical skills'}.`,
    missingKeywords.length
      ? `De-emphasize or fix gaps around: ${topGaps}.`
      : 'Keep the message tight; the job description already aligns well with your profile.',
    hasProjects
      ? 'Use your project section as proof, not as a list of tools.'
      : 'Add at least one project example before applying so your profile has evidence.',
    hasExperience
      ? 'Connect your experience directly to the job requirements instead of describing responsibilities generally.'
      : 'For fresher positioning, frame projects, learning speed, and practical implementation clearly.',
  ];

  const talkingPoints = [
    matchedKeywords.length
      ? `I have hands-on exposure to ${primaryStrengths}, which maps directly to this role.`
      : `I am building practical skills for ${targetRole} roles and can show that through projects.`,
    hasProjects
      ? 'My project work shows I can turn requirements into working features, not just understand concepts.'
      : 'I am ready to demonstrate my ability through a focused project or assignment.',
    missingKeywords.length
      ? `I noticed the role values ${topGaps}; I am actively closing those gaps and can discuss my learning plan.`
      : 'The role requirements align well with the way I have been building my profile.',
    'I can communicate tradeoffs, learn quickly, and adapt my work to the team’s stack.',
  ];

  const riskAreas = [
    ...(missingKeywords.length ? [`Missing visible evidence for: ${topGaps}.`] : []),
    ...(!hasProjects ? ['Projects section is empty, so the application may feel unproven.'] : []),
    ...(!hasExperience ? ['No formal experience listed, so project outcomes need to be very clear.'] : []),
    score < 45 ? 'Match score is low; applying without tailoring may look generic.' : null,
  ].filter(Boolean);

  return {
    positioning,
    recommendedContent: recommendation,
    focusPlan,
    talkingPoints,
    riskAreas: riskAreas.length ? riskAreas : ['No major risk area detected. Keep the application specific and evidence-based.'],
  };
}

export function matchJob({ skills, projects, experience, targetRole, jobDescription }) {
  const candidateText = [skills, projects, experience, targetRole].filter(Boolean).join(' ');
  const candidateTerms = new Set(extractPhrases(candidateText));
  const jobTerms = topTerms(extractPhrases(jobDescription), 30);

  const matchedKeywords = jobTerms.filter((term) => candidateTerms.has(term));
  const missingKeywords = jobTerms.filter((term) => !candidateTerms.has(term)).slice(0, 12);

  const weightedScore = jobTerms.length ? Math.round((matchedKeywords.length / jobTerms.length) * 100) : 0;
  const score = Math.max(0, Math.min(100, weightedScore));

  const strategy = buildStrategy({ score, matchedKeywords, missingKeywords, targetRole, skills, projects, experience });

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
    strategy,
  };
}
