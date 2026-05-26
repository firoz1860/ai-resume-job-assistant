import { overlapScore } from '../utils/textAnalysis.js';
import { dbState } from '../config/db.js';
import JobAnalysis from '../models/JobAnalysis.js';

export async function analyzeJob(req, res) {
  const { profileText, resumeText, jobDescription, targetCompany, targetRole } = req.body;

  if (!jobDescription?.trim()) return res.status(400).json({ success: false, error: 'Job description is required.' });
  if (!profileText?.trim() && !resumeText?.trim()) return res.status(400).json({ success: false, error: 'Profile or resume text is required.' });

  const profile = [profileText, resumeText, targetRole].filter(Boolean).join(' ');
  const match = overlapScore(profile, jobDescription);
  const company = targetCompany || 'the company';
  const role = targetRole || 'this role';
  const data = {
    matchPercentage: match.score,
    matchedSkills: match.matched,
    missingSkills: match.missing,
    importantKeywords: match.targetKeywords,
    resumeKeywordsToAdd: match.missing.slice(0, 8),
    customResumeSummary: `${role} candidate with strengths in ${match.matched.slice(0, 4).join(', ') || 'relevant technical skills'}, focused on building practical solutions aligned with ${company}'s needs.`,
    customCoverLetter: `I am interested in the ${role} opportunity at ${company} because the role aligns with my practical experience and current growth direction. My background shows overlap in ${match.matched.slice(0, 4).join(', ') || 'core role requirements'}, and I am actively strengthening gaps around ${match.missing.slice(0, 4).join(', ') || 'the remaining requirements'}. I would welcome the chance to discuss how I can contribute and keep growing with your team.`,
    recruiterMessage: `Hi, I came across the ${role} opening at ${company}. My background aligns with ${match.matched.slice(0, 3).join(', ') || 'the role requirements'}, and I would be glad to connect or learn more about the opportunity.`,
    finalRecommendation: match.score >= 70 ? 'Apply now with tailored content.' : match.score >= 45 ? 'Apply after improving resume keywords and project proof.' : 'Improve profile evidence before applying to similar roles.',
  };

  if (dbState.isConnected && req.user?._id) {
    try {
      await JobAnalysis.create({
        userId: req.user._id,
        targetRole,
        targetCompany,
        jobDescription,
        result: data,
      });
    } catch (saveErr) {
      console.warn(`[JobAnalyzer] Analysis generated but not saved: ${saveErr.message}`);
    }
  }

  res.json({
    success: true,
    data,
  });
}
