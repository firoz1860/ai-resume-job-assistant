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
          followUpsDue: [],
          nextActions: [
            { label: 'Complete your profile', href: '/profile', help: 'Add skills, projects, and target role.' },
            { label: 'Analyze a job', href: '/job-analyzer', help: 'Compare your profile with a real job description.' },
            { label: 'Start interview practice', href: '/voice-interview', help: 'Get scored practice and feedback.' },
          ],
        },
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const [
      applications,
      followUpsDue,
      applicationCount,
      generatedCount,
      textInterviews,
      voiceInterviews,
      textInterviewCount,
      voiceInterviewCount,
      jobAnalyses,
      roadmapCount,
    ] = await Promise.all([
      Application.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Application.find({
        userId,
        followUpDate: { $ne: '', $lte: today },
        status: { $nin: ['Rejected', 'Offer'] },
      }).sort({ followUpDate: 1 }).limit(5).lean(),
      Application.countDocuments({ userId }),
      GeneratedContent.countDocuments({ userId }),
      InterviewSession.find({ userId, mode: { $ne: 'voice' } }).sort({ createdAt: -1 }).limit(10).lean(),
      InterviewSession.find({ userId, mode: 'voice' }).sort({ createdAt: -1 }).limit(10).lean(),
      InterviewSession.countDocuments({ userId, mode: { $ne: 'voice' } }),
      InterviewSession.countDocuments({ userId, mode: 'voice' }),
      JobAnalysis.countDocuments({ userId }),
      Roadmap.countDocuments({ userId }),
    ]);

    const allInterviews = [...textInterviews, ...voiceInterviews];
    const interviewCount = textInterviewCount + voiceInterviewCount;
    const scored = allInterviews.filter((item) => Number.isFinite(item.overallScore));
    const avgScore = scored.length ? Math.round(scored.reduce((sum, item) => sum + item.overallScore, 0) / scored.length) : 0;
    const lastInterview = allInterviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const careerScore = avgScore || (applicationCount ? 45 : 0);

    const recentActivities = [
      ...applications.map((item) => ({ type: 'Application', title: `${item.companyName || 'Company'} - ${item.role || 'Role'}`, date: item.createdAt })),
      ...allInterviews.slice(0, 3).map((item) => ({ type: item.mode === 'voice' ? 'Voice Interview' : 'Interview', title: item.targetRole || 'Interview practice', date: item.createdAt })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
    const suggestedActions = [
      !generatedCount && { label: 'Generate first application asset', href: '/generator', help: 'Create a resume summary, recruiter message, or cover letter.' },
      !jobAnalyses && { label: 'Analyze a job description', href: '/job-analyzer', help: 'Find match score, missing skills, and ATS keywords.' },
      !interviewCount && { label: 'Start a voice interview', href: '/voice-interview', help: 'Practice aloud and get scored feedback.' },
      followUpsDue.length && { label: 'Send due follow-ups', href: '/applications', help: `${followUpsDue.length} application follow-up${followUpsDue.length === 1 ? '' : 's'} due.` },
      !roadmapCount && { label: 'Create a skill roadmap', href: '/roadmap', help: 'Turn your target role into weekly tasks.' },
    ].filter(Boolean).slice(0, 4);
    const nextActions = suggestedActions.length ? suggestedActions : [
      { label: 'Review Career Intelligence', href: '/career-intelligence', help: 'Check your readiness, weak areas, and career timeline.' },
      { label: 'Update application pipeline', href: '/applications', help: 'Keep statuses, notes, and follow-up dates fresh.' },
    ];

    res.json({
      success: true,
      message: 'Dashboard stats loaded.',
      data: {
        stats: [
          { label: 'Career Score', value: `${careerScore}%`, help: avgScore ? 'Based on interview performance' : 'Run interviews and tracking to improve' },
          { label: 'Generated', value: String(generatedCount), help: 'Application assets' },
          { label: 'Applications', value: String(applicationCount), help: 'Tracked roles' },
          { label: 'Practice', value: String(interviewCount), help: 'Interview sessions' },
        ],
        progress: [
          { label: 'Profile analyzed', value: careerScore ? Math.min(100, careerScore) : 0 },
          { label: 'Job matched', value: Math.min(100, jobAnalyses * 25) },
          { label: 'Content generated', value: Math.min(100, generatedCount * 20) },
          { label: 'Interview practiced', value: Math.min(100, interviewCount * 20) },
          { label: 'Applications tracked', value: Math.min(100, applicationCount * 20) },
          { label: 'Roadmap created', value: Math.min(100, roadmapCount * 50) },
        ],
        recentActivities,
        followUpsDue: followUpsDue.map((item) => ({
          id: item._id,
          companyName: item.companyName,
          role: item.role,
          followUpDate: item.followUpDate,
          status: item.status,
        })),
        nextActions,
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
