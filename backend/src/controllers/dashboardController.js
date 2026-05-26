import { dbState } from '../config/db.js';
import Application from '../models/Application.js';
import GeneratedContent from '../models/GeneratedContent.js';
import InterviewSession from '../models/InterviewSession.js';
import JobAnalysis from '../models/JobAnalysis.js';
import Roadmap from '../models/Roadmap.js';

export async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user._id;

    if (!dbState.isConnected) {
      return res.json({
        success: true,
        message: 'Dashboard stats loaded from fallback mode.',
        data: {
          stats: [
            { label: 'Career Score', value: '0%', help: 'Run Career DNA to calculate' },
            { label: 'Generated', value: '0', help: 'Application assets' },
            { label: 'Applications', value: '0', help: 'Tracked roles' },
            { label: 'Practice', value: '0', help: 'Interview sessions' },
          ],
          progress: [
            { label: 'Profile analyzed', value: 0 },
            { label: 'Job matched', value: 0 },
            { label: 'Content generated', value: 0 },
            { label: 'Interview practiced', value: 0 },
            { label: 'Applications tracked', value: 0 },
          ],
          recentActivities: [],
        },
      });
    }

    const [applications, generatedCount, textInterviews, voiceInterviews, jobAnalyses, roadmapCount] = await Promise.all([
      Application.find({ userId }).sort({ createdAt: -1 }).limit(5),
      GeneratedContent.countDocuments({ userId }),
      InterviewSession.find({ userId, mode: { $ne: 'voice' } }).sort({ createdAt: -1 }).limit(10),
      InterviewSession.find({ userId, mode: 'voice' }).sort({ createdAt: -1 }).limit(10),
      JobAnalysis.countDocuments({ userId }),
      Roadmap.countDocuments({ userId }),
    ]);

    const allInterviews = [...textInterviews, ...voiceInterviews];
    const scored = allInterviews.filter((item) => Number.isFinite(item.overallScore));
    const avgScore = scored.length ? Math.round(scored.reduce((sum, item) => sum + item.overallScore, 0) / scored.length) : 0;
    const lastInterview = allInterviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const careerScore = avgScore || (applications.length ? 45 : 0);

    const recentActivities = [
      ...applications.map((item) => ({ type: 'Application', title: `${item.companyName || 'Company'} - ${item.role || 'Role'}`, date: item.createdAt })),
      ...allInterviews.slice(0, 3).map((item) => ({ type: item.mode === 'voice' ? 'Voice Interview' : 'Interview', title: item.targetRole || 'Interview practice', date: item.createdAt })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    res.json({
      success: true,
      message: 'Dashboard stats loaded.',
      data: {
        stats: [
          { label: 'Career Score', value: `${careerScore}%`, help: avgScore ? 'Based on interview performance' : 'Run interviews and tracking to improve' },
          { label: 'Generated', value: String(generatedCount), help: 'Application assets' },
          { label: 'Applications', value: String(applications.length), help: 'Recent tracked roles' },
          { label: 'Practice', value: String(allInterviews.length), help: 'Interview sessions' },
        ],
        progress: [
          { label: 'Profile analyzed', value: careerScore ? Math.min(100, careerScore) : 0 },
          { label: 'Job matched', value: Math.min(100, jobAnalyses * 25) },
          { label: 'Content generated', value: Math.min(100, generatedCount * 20) },
          { label: 'Interview practiced', value: Math.min(100, allInterviews.length * 20) },
          { label: 'Applications tracked', value: Math.min(100, applications.length * 20) },
          { label: 'Roadmap created', value: Math.min(100, roadmapCount * 50) },
        ],
        recentActivities,
        lastInterview: lastInterview ? {
          targetRole: lastInterview.targetRole,
          type: lastInterview.mode === 'voice' ? 'Voice Interview' : 'Interview',
          score: lastInterview.overallScore || 0,
          status: lastInterview.status,
        } : null,
      },
    });
  } catch (err) {
    next(err);
  }
}
