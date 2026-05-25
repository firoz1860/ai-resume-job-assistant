const toneInstructions = {
  Professional: {
    voice: 'formal, polished, and business-appropriate',
    linkedinOpen: 'I noticed your work',
    rules: [
      'Use precise, recruiter-friendly language.',
      'Keep the writing composed and credible.',
      'Avoid slang, hype, jokes, and overly casual phrasing.',
    ],
  },
  Confident: {
    voice: 'assertive, direct, and results-driven',
    linkedinOpen: 'Your work stood out to me',
    rules: [
      'Lead with ownership, measurable impact, and strong verbs.',
      'Sound assured without sounding arrogant.',
      'Avoid hesitant phrases like "I think", "maybe", or "I hope".',
    ],
  },
  'Fresher Friendly': {
    voice: 'enthusiastic, practical, and early-career appropriate',
    linkedinOpen: 'I am exploring this field and found your work inspiring',
    rules: [
      'Emphasize projects, skills, learning ability, and potential.',
      'Do not pretend the candidate has senior-level experience.',
      'Frame limited experience positively and honestly.',
    ],
  },
  Concise: {
    voice: 'brief, focused, and high-signal',
    linkedinOpen: 'I came across your profile',
    rules: [
      'Use shorter sentences and remove filler.',
      'Keep only the most relevant details.',
      'Do not repeat the same idea in different words.',
    ],
  },
  Humanized: {
    voice: 'warm, conversational, and natural',
    linkedinOpen: 'I came across your profile and liked how you describe your work',
    rules: [
      'Sound like a thoughtful person wrote it, not a template.',
      'Use natural transitions and varied sentence rhythm.',
      'Avoid corporate buzzwords and robotic phrasing.',
    ],
  },
};

const contentInstructions = {
  'Resume Summary': {
    systemRole: 'You write only resume summary content.',
    maxOutputTokens: 260,
    format: [
      'Output exactly one resume summary paragraph.',
      'Length: 3-5 sentences.',
      'No greeting, no sign-off, no headings, no bullets, no first-person pronouns.',
      'Do not write a cover letter, email, LinkedIn message, or interview answer.',
    ],
  },
  'Cover Letter': {
    systemRole: 'You write only finished cover letters.',
    maxOutputTokens: 700,
    format: [
      'Output a finished cover letter in 3-4 normal paragraphs.',
      'Length: 250-350 words.',
      'No bullet points, no outline labels, no markdown, no drafting notes.',
      'Open with a strong role-specific hook.',
      'Close with a confident call to action.',
    ],
  },
  'Cold Email': {
    systemRole: 'You write only cold outreach emails.',
    maxOutputTokens: 320,
    format: [
      'Output a cold email only.',
      'First line must begin with "Subject:".',
      'Body length: 90-140 words.',
      'Include a greeting, short body, clear small ask, and sign-off.',
      'Do not write a cover letter, resume summary, LinkedIn message, or interview answer.',
    ],
  },
  'LinkedIn Message': {
    systemRole: 'You write only short LinkedIn connection request messages.',
    maxOutputTokens: 120,
    format: [
      'Output one LinkedIn connection request message only.',
      'Maximum 300 characters, not words.',
      'One short paragraph only.',
      'No subject line, no greeting like "Dear", no sign-off, no bullets, no markdown.',
      'Do not ask directly for a job.',
      'Do not write a cover letter, email, resume summary, or interview answer.',
    ],
  },
  'Tell Me About Yourself': {
    systemRole: 'You write only spoken interview answers.',
    maxOutputTokens: 420,
    format: [
      'Output a spoken "Tell me about yourself" interview answer only.',
      'Length: 150-200 words.',
      'Use first person voice.',
      'Use Present-Past-Future flow without headings.',
      'Do not write a cover letter, email, LinkedIn message, or resume summary.',
    ],
  },
  'Project Explanation': {
    systemRole: 'You write only spoken technical project explanations.',
    maxOutputTokens: 340,
    format: [
      'Output a spoken project explanation only.',
      'Length: 100-150 words.',
      'Explain what it does, technologies used, one challenge, solution, and impact.',
      'Do not write a cover letter, email, LinkedIn message, or resume summary.',
    ],
  },
};

function clean(value, fallback) {
  return value?.trim() || fallback;
}

function oneLine(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function firstSkill(skills) {
  return clean(skills, 'relevant skills').split(',')[0].trim();
}

function shortenTo(value, maxLength) {
  const text = oneLine(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}.`;
}

function buildSystemInstruction(contentType, tone) {
  const contentConfig = contentInstructions[contentType] || contentInstructions['Resume Summary'];
  const toneConfig = toneInstructions[tone] || toneInstructions.Professional;

  return `
${contentConfig.systemRole}
The selected content type is "${contentType}". Never output a different content type.
The selected tone is "${tone}". Write in a ${toneConfig.voice} tone.
Return only the final user-ready content.
No analysis, no explanation, no alternate options, no outline, no markdown.
`.trim();
}

export function buildPrompt({ contentType, tone, fullName, education, skills, projects, experience, targetRole, companyName, jobDescription }) {
  const contentConfig = contentInstructions[contentType] || contentInstructions['Resume Summary'];
  const toneConfig = toneInstructions[tone] || toneInstructions.Professional;

  const candidate = {
    fullName: clean(fullName, 'Not specified'),
    education: clean(education, 'Not specified'),
    skills: clean(skills, 'Not specified'),
    projects: clean(projects, 'Not specified'),
    experience: clean(experience, 'Fresher / No formal experience'),
    targetRole: clean(targetRole, 'Not specified'),
    companyName: clean(companyName, 'Not specified'),
    jobDescription: clean(jobDescription, 'Not provided'),
  };

  const userPrompt = `
Generate content using this exact contract.

SELECTED_CONTENT_TYPE: ${contentType}
SELECTED_TONE: ${tone}

Required format:
${contentConfig.format.map((rule) => `- ${rule}`).join('\n')}

Tone rules:
${toneConfig.rules.map((rule) => `- ${rule}`).join('\n')}

Candidate data:
- Name: ${candidate.fullName}
- Education: ${candidate.education}
- Skills: ${candidate.skills}
- Projects: ${candidate.projects}
- Experience: ${candidate.experience}
- Target Role: ${candidate.targetRole}
- Target Company: ${candidate.companyName}
- Job Description: ${candidate.jobDescription}

Final check before answering:
If SELECTED_CONTENT_TYPE is "LinkedIn Message", your entire response must be one message under 300 characters.
If SELECTED_CONTENT_TYPE is "Cover Letter", your response must be a full cover letter.
If SELECTED_CONTENT_TYPE is "Cold Email", your response must start with "Subject:".
Now return only the final ${contentType}.
`.trim();

  return {
    systemInstruction: buildSystemInstruction(contentType, tone),
    userPrompt,
    contentType,
    tone,
    maxOutputTokens: contentConfig.maxOutputTokens,
    candidate,
  };
}

export function enforceContentType(output, promptSpec) {
  const text = output.trim();
  const { contentType, tone, candidate } = promptSpec;

  if (contentType === 'LinkedIn Message') {
    const looksLikeLongForm = text.length > 300 || /\n{2,}/.test(text) || /^(dear|subject:)/i.test(text) || /(sincerely|regards|thank you for your consideration)/i.test(text);
    if (!looksLikeLongForm) return oneLine(text);

    const toneConfig = toneInstructions[tone] || toneInstructions.Professional;
    const company = candidate.companyName === 'Not specified' ? 'your work' : `${candidate.companyName}'s work`;
    const message = `Hi, ${toneConfig.linkedinOpen} around ${company}. I am ${candidate.fullName}, building skills in ${firstSkill(candidate.skills)} for ${candidate.targetRole} roles. Would be glad to connect and learn from your journey.`;
    return shortenTo(message, 300);
  }

  if (contentType === 'Cold Email' && !/^Subject:/i.test(text)) {
    const company = candidate.companyName === 'Not specified' ? 'your team' : candidate.companyName;
    return `Subject: Exploring ${candidate.targetRole} opportunities\n\nHi,\n\nI am ${candidate.fullName}, with a background in ${candidate.education} and skills in ${candidate.skills}. I have been working on ${candidate.projects}, and I am interested in how I could contribute to ${company} in a ${candidate.targetRole} role.\n\nWould you be open to a brief conversation or pointing me toward the right opportunity?\n\nBest,\n${candidate.fullName}`;
  }

  if (contentType === 'Resume Summary' && /^(dear|subject:)/i.test(text)) {
    return `${candidate.targetRole} candidate with a background in ${candidate.education} and hands-on skills in ${candidate.skills}. Experienced through ${candidate.projects}, with an interest in building practical, user-focused solutions. Looking to contribute to ${candidate.companyName === 'Not specified' ? 'a strong engineering team' : candidate.companyName} in a role aligned with ${candidate.targetRole}.`;
  }

  return text;
}
