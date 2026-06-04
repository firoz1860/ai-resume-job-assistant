import { dbState } from '../config/db.js';
import Roadmap from '../models/Roadmap.js';

function splitSkills(value = '') {
  return String(value)
    .split(/[,|\n]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function durationToWeeks(duration = '') {
  const match = String(duration).match(/\d+/);
  const weeks = match ? Number(match[0]) : 4;
  return [2, 4, 8].includes(weeks) ? weeks : 4;
}

function pick(items, start, count = 3) {
  if (!items.length) return [];
  return Array.from({ length: Math.min(count, items.length) }, (_, offset) => items[(start + offset) % items.length]);
}

function buildWeeklyPlan({ currentSkills, targetRole, timePerDay, duration, level }) {
  const weeks = durationToWeeks(duration);
  const skills = splitSkills(currentSkills);
  const normalizedRole = targetRole.trim();
  const dailyTime = timePerDay || '1 hour';
  const defaultTopics = ['Programming fundamentals', 'Role workflows', 'Project delivery', 'Interview practice'];
  const skillTopics = skills.length ? skills : defaultTopics;
  const levelFocus = {
    Beginner: ['syntax and core concepts', 'guided implementation', 'debugging habits', 'portfolio proof'],
    Intermediate: ['architecture decisions', 'integration work', 'testing discipline', 'deployment readiness'],
    Advanced: ['scalable design', 'performance tuning', 'security tradeoffs', 'system design proof'],
  }[level] || ['core concepts', 'implementation', 'testing', 'deployment'];

  const phases = weeks === 2
    ? ['Gap fixing and quick build', 'Capstone polish and interview prep']
    : weeks === 8
      ? [
        'Foundation audit and setup',
        'Core frontend/application workflow',
        'Backend and API implementation',
        'Database design and querying',
        'Testing and error handling',
        'Deployment and performance',
        'Capstone feature sprint',
        'Interview, resume, and portfolio polish',
      ]
      : [
        'Foundation and gap fixing',
        'Feature-building sprint',
        'Full-stack integration and quality',
        'Capstone and interview preparation',
      ];

  return Array.from({ length: weeks }, (_, index) => {
    const week = index + 1;
    const topics = [...new Set([
      ...pick(skillTopics, index * 2, 3),
      levelFocus[index % levelFocus.length],
    ])].slice(0, 4);
    const primarySkill = topics[0] || normalizedRole;
    const secondarySkill = topics[1] || 'project workflow';
    const finalWeek = index === weeks - 1;

    return {
      week,
      focus: phases[index] || `${normalizedRole} skill sprint ${week}`,
      topics,
      dailyTasks: finalWeek
        ? [
          `Spend ${dailyTime} daily revising weak areas from weeks 1-${Math.max(1, weeks - 1)}.`,
          `Finish and deploy one ${normalizedRole} capstone feature using ${topics.slice(0, 3).join(', ')}.`,
          'Prepare 5 interview answers and update resume bullets with measurable proof.',
        ]
        : [
          `Spend ${dailyTime} daily on ${primarySkill} for ${normalizedRole}.`,
          `Build one focused ${secondarySkill} feature and test it with real sample data.`,
          `Document one bug, one design decision, and one resume bullet from this week.`,
        ],
      miniProject: finalWeek
        ? `${normalizedRole} capstone: deploy a portfolio-ready workflow using ${topics.slice(0, 3).join(', ')}`
        : `${normalizedRole} module ${week}: build a ${primarySkill} feature connected to ${secondarySkill}`,
    };
  });
}

export async function createRoadmap(req, res) {
  const { currentSkills, targetRole, timePerDay, duration = '4 weeks', level = 'Beginner' } = req.body;
  if (!currentSkills?.trim()) return res.status(400).json({ success: false, error: 'Current skills are required.' });
  if (!targetRole?.trim()) return res.status(400).json({ success: false, error: 'Target role is required.' });

  const plan = buildWeeklyPlan({ currentSkills, targetRole, timePerDay, duration, level });

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
