import { extractKeywords, overlapScore, titleCase } from '../utils/textAnalysis.js';

export function analyzeCareer(req, res) {
  const { fullName, education, skills, projects, experience, targetRole, dreamCompany, resumeText } = req.body;

  if (!skills?.trim()) return res.status(400).json({ success: false, error: 'Skills are required.' });
  if (!targetRole?.trim()) return res.status(400).json({ success: false, error: 'Target role is required.' });

  const profileText = [education, skills, projects, experience, resumeText].filter(Boolean).join(' ');
  const role = targetRole.toLowerCase();
  const expectedSkills = role.includes('frontend')
    ? 'react javascript typescript html css responsive git api performance'
    : role.includes('backend')
      ? 'node.js express database sql mongodb rest api authentication docker testing'
      : role.includes('full stack')
        ? 'react node.js javascript typescript rest api database git deployment'
        : 'communication projects problem solving git api testing';
  const targetText = `${expectedSkills} ${dreamCompany || ''}`;
  const match = overlapScore(profileText, targetText);
  const profileKeywords = extractKeywords(profileText, 12).map(titleCase);
  const score = Math.min(100, Math.max(35, Math.round((match.score + Math.min(profileKeywords.length * 6, 55)) / 1.2)));

  const bestFitRoles = [...new Set([
    targetRole,
    targetRole.toLowerCase().includes('frontend') ? 'React Developer' : 'Full Stack Developer',
    targetRole.toLowerCase().includes('backend') ? 'API Developer' : 'Software Engineer',
  ])];

  res.json({
    success: true,
    data: {
      name: fullName || 'Candidate',
      careerStrengthScore: score,
      bestFitRoles,
      strengths: profileKeywords.slice(0, 6),
      weakAreas: match.missing.length ? match.missing.slice(0, 6) : ['Add stronger proof of impact', 'Add measurable project outcomes'],
      missingSkills: match.missing,
      resumeImprovements: [
        'Move the strongest role-matching skills into the top summary.',
        'Rewrite project bullets with action, technology, and measurable result.',
        'Add keywords from target job descriptions naturally, not as a keyword dump.',
      ],
      projectImprovements: [
        'Add one production-style project with authentication, API integration, and deployment.',
        'Document architecture, tradeoffs, and screenshots in the README.',
        'Add metrics such as load time, users, accuracy, or automation time saved.',
      ],
      actionPlan: [
        'Week 1: Fix resume summary and top 3 project bullets.',
        'Week 2: Build or polish one role-specific project.',
        'Week 3: Add missing keywords through proof-based bullets.',
        'Week 4: Practice interview stories and apply to 15 targeted roles.',
      ],
    },
  });
}
