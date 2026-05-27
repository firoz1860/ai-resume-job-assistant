import { dbState } from '../config/db.js';
import Application from '../models/Application.js';
import GeneratedContent from '../models/GeneratedContent.js';
import InterviewSession from '../models/InterviewSession.js';
import ResumeVersion from '../models/ResumeVersion.js';
import User from '../models/User.js';

export async function getAdminStats(req, res) {
  if (!dbState.isConnected) {
    return res.json({
      success: true,
      message: 'Admin metrics are in fallback mode.',
      data: {
        totalUsers: 0,
        generatedContent: 0,
        interviewsCompleted: 0,
        trackedApplications: 0,
        resumeVersions: 0,
        averageScore: 0,
        commonTargetRoles: [],
      },
    });
  }

  const [totalUsers, generatedContent, interviewsCompleted, trackedApplications, resumeVersions, scored, roles] = await Promise.all([
    User.countDocuments(),
    GeneratedContent.countDocuments(),
    InterviewSession.countDocuments({ status: 'completed' }),
    Application.countDocuments(),
    ResumeVersion.countDocuments(),
    InterviewSession.find({ overallScore: { $gt: 0 } }).select('overallScore').lean(),
    InterviewSession.aggregate([
      { $match: { targetRole: { $nin: [null, ''] } } },
      { $group: { _id: '$targetRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, item) => sum + Number(item.overallScore || 0), 0) / scored.length)
    : 0;

  res.json({
    success: true,
    message: 'Admin metrics loaded.',
    data: {
      totalUsers,
      generatedContent,
      interviewsCompleted,
      trackedApplications,
      resumeVersions,
      averageScore,
      commonTargetRoles: roles.map((item) => ({ role: item._id, count: item.count })),
    },
  });
}
