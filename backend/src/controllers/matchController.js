import { matchJob } from '../utils/jobMatcher.js';

export function match(req, res) {
  const { skills, projects, experience, targetRole, jobDescription } = req.body;

  if (!skills?.trim()) {
    return res.status(400).json({ success: false, error: 'Skills are required.' });
  }
  if (!targetRole?.trim()) {
    return res.status(400).json({ success: false, error: 'Target role is required.' });
  }
  if (!jobDescription?.trim()) {
    return res.status(400).json({ success: false, error: 'Job description is required.' });
  }

  const data = matchJob({ skills, projects, experience, targetRole, jobDescription });
  res.json({ success: true, data });
}
