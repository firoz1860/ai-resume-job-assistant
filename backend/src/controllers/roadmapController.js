import { dbState } from '../config/db.js';
import Roadmap from '../models/Roadmap.js';

export async function createRoadmap(req, res) {
  const { currentSkills, targetRole, timePerDay, duration = '4 weeks', level = 'Beginner' } = req.body;
  if (!currentSkills?.trim()) return res.status(400).json({ success: false, error: 'Current skills are required.' });
  if (!targetRole?.trim()) return res.status(400).json({ success: false, error: 'Target role is required.' });

  const weeks = duration.includes('8') ? 8 : duration.includes('2') ? 2 : 4;
  const plan = Array.from({ length: weeks }, (_, index) => ({
    week: index + 1,
    focus: index === 0 ? 'Foundation and gap fixing' : index === weeks - 1 ? 'Capstone and interview preparation' : 'Role-specific project building',
    topics: index === 0 ? ['Core concepts', 'Tooling', 'Git workflow'] : ['APIs', 'Testing', 'Deployment'],
    dailyTasks: [
      `Study ${timePerDay || '1 hour'} daily for ${targetRole} fundamentals.`,
      'Build one small feature and document what you learned.',
      'Revise one resume/project bullet using the new skill.',
    ],
    miniProject: index === weeks - 1 ? `${targetRole} capstone project` : `${targetRole} practice module ${index + 1}`,
  }));

  const data = {
    targetRole,
    level,
    duration,
    plan,
    resources: [`${targetRole} roadmap`, `${targetRole} interview questions`, `${targetRole} project ideas`],
    capstoneProject: `Build and deploy a ${targetRole} portfolio project using ${currentSkills}.`,
  };

  if (dbState.isConnected && req.user?._id) {
    try {
      await Roadmap.create({
        userId: req.user._id,
        targetRole,
        currentSkills,
        duration,
        level,
        plan: data,
      });
    } catch (saveErr) {
      console.warn(`[Roadmap] Roadmap generated but not saved: ${saveErr.message}`);
    }
  }

  res.json({ success: true, data });
}
