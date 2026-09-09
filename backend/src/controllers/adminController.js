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

  const [totalUsers, generatedContent, interviewsCompleted, trackedApplications, resumeVersions, scoreAgg, roles] = await Promise.all([
    User.countDocuments(),
    GeneratedContent.countDocuments(),
    InterviewSession.countDocuments({ status: 'completed' }),
    Application.countDocuments(),
    ResumeVersion.countDocuments(),
    // Average computed in the DB (scales instead of loading every session into memory).
    InterviewSession.aggregate([
      { $match: { overallScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$overallScore' } } },
    ]),
    InterviewSession.aggregate([
      { $match: { targetRole: { $nin: [null, ''] } } },
      { $group: { _id: '$targetRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const averageScore = scoreAgg.length ? Math.round(scoreAgg[0].avg) : 0;

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
