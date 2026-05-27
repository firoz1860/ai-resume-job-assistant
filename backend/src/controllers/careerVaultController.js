import { dbState } from '../config/db.js';
import Application from '../models/Application.js';
import CareerProfile from '../models/CareerProfile.js';
import GeneratedContent from '../models/GeneratedContent.js';
import InterviewMessage from '../models/InterviewMessage.js';
import InterviewSession from '../models/InterviewSession.js';
import JobAnalysis from '../models/JobAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import ResumeVersion from '../models/ResumeVersion.js';
import { extractKeywords } from '../utils/textAnalysis.js';

function includesQuery(text, query) {
  if (!query) return true;
  return String(text || '').toLowerCase().includes(query.toLowerCase());
}

function item(id, type, title, description, href, meta = {}) {
  return {
    id: String(id),
    type,
    title: title || type,
    description: description || '',
    href,
    meta,
  };
}

function searchItems(items, query) {
  return items.filter((entry) => (
    includesQuery(entry.title, query)
    || includesQuery(entry.description, query)
    || Object.values(entry.meta || {}).some((value) => includesQuery(value, query))
  ));
}

export async function searchCareerVault(req, res) {
  const query = String(req.query.q || '').trim();

  if (!dbState.isConnected) {
    return res.json({
      success: true,
      message: 'Career Vault is running in fallback mode.',
      data: {
        query,
        summary: { total: 0, profileComplete: 0, applications: 0, generated: 0, interviews: 0, roadmaps: 0 },
        keywords: [],
        results: [],
        suggestions: ['Connect MongoDB and save profile data to unlock Career Vault search.'],
      },
    });
  }

  const userId = req.user._id;
  const [profile, applications, generated, sessions, messages, jobAnalyses, roadmaps, resumeVersions] = await Promise.all([
    CareerProfile.findOne({ userId }).lean(),
    Application.find({ userId }).sort({ updatedAt: -1 }).limit(50).lean(),
    GeneratedContent.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
    InterviewSession.find({ userId }).sort({ createdAt: -1 }).limit(30).lean(),
    InterviewMessage.find({ userId }).sort({ createdAt: -1 }).limit(80).lean(),
    JobAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(30).lean(),
    Roadmap.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    ResumeVersion.find({ userId }).sort({ updatedAt: -1 }).limit(30).lean(),
  ]);

  const profileText = profile
    ? [
      profile.education,
      profile.skills,
      profile.projects,
      profile.experience,
      profile.targetRole,
      profile.dreamCompany,
      profile.resumeText,
      profile.certifications,
      profile.achievements,
    ].filter(Boolean).join('\n')
    : '';

  const vaultItems = [
    ...(profile ? [
      item(
        profile._id,
        'Profile',
        profile.targetRole ? `${profile.targetRole} profile` : 'Career profile',
        profileText.slice(0, 360),
        '/profile',
        { dreamCompany: profile.dreamCompany, skills: profile.skills }
      ),
    ] : []),
    ...applications.map((app) => item(
      app._id,
      'Application',
      `${app.companyName || 'Company'} - ${app.role || 'Role'}`,
      [app.notes, app.jobDescription, app.companyResearch, app.projectEvidence].filter(Boolean).join('\n').slice(0, 360),
      '/applications',
      { status: app.status, priority: app.priority, followUpDate: app.followUpDate, source: app.source }
    )),
    ...generated.map((content) => item(
      content._id,
      'Generated Content',
      content.contentType || 'Generated asset',
      content.content,
      '/content-library',
      { tone: content.tone, createdAt: content.createdAt }
    )),
    ...sessions.map((session) => item(
      session._id,
      session.mode === 'voice' ? 'Voice Interview' : 'Interview',
      `${session.targetRole || 'Interview'} - ${session.interviewType || 'Practice'}`,
      session.finalReport?.finalVerdict || `${session.status || 'active'} interview session`,
      session.mode === 'voice' ? `/voice-interview/${session._id}` : `/interview-history`,
      { score: session.overallScore, difficulty: session.difficulty, status: session.status }
    )),
    ...messages.map((message) => item(
      message._id,
      'Interview Message',
      message.question || message.nextQuestion || 'Interview answer',
      [message.answer, message.transcript, message.feedback, message.betterAnswer].filter(Boolean).join('\n').slice(0, 360),
      '/interview-history',
      { score: message.score, role: message.role }
    )),
    ...jobAnalyses.map((analysis) => item(
      analysis._id,
      'Job Analysis',
      `${analysis.targetCompany || 'Company'} - ${analysis.targetRole || 'Role'}`,
      JSON.stringify(analysis.result || analysis).slice(0, 360),
      '/job-analyzer',
      { company: analysis.targetCompany, role: analysis.targetRole }
    )),
    ...roadmaps.map((roadmap) => item(
      roadmap._id,
      'Roadmap',
      `${roadmap.targetRole || 'Target role'} roadmap`,
      JSON.stringify(roadmap.plan || {}).slice(0, 360),
      '/roadmap',
      { duration: roadmap.duration, level: roadmap.level }
    )),
    ...resumeVersions.map((version) => item(
      version._id,
      'Resume Version',
      version.title || `${version.targetRole || 'ATS'} resume`,
      Object.values(version.sections || {}).filter(Boolean).join('\n').slice(0, 360),
      '/resume-builder',
      { companyName: version.companyName, targetRole: version.targetRole, source: version.source }
    )),
  ];

  const results = searchItems(vaultItems, query).slice(0, 60);
  const combinedText = [
    profileText,
    applications.map((app) => `${app.role} ${app.jobDescription} ${app.notes}`).join('\n'),
    generated.map((content) => content.content).join('\n'),
    sessions.map((session) => `${session.targetRole} ${session.interviewType} ${session.finalReport?.finalVerdict || ''}`).join('\n'),
  ].join('\n');

  const filledProfileFields = profile
    ? Object.values(profile).filter((value) => typeof value === 'string' && value.trim()).length
    : 0;

  const suggestions = [
    !profile && 'Create your profile so AI can personalize every module.',
    profile && filledProfileFields < 8 && 'Add more profile proof: projects, achievements, links, and resume text.',
    applications.length === 0 && 'Track at least one application to unlock pipeline intelligence.',
    sessions.length === 0 && 'Complete one interview to create searchable feedback history.',
    generated.length === 0 && 'Generate and save application assets for future reuse.',
  ].filter(Boolean);

  res.json({
    success: true,
    message: 'Career Vault loaded.',
    data: {
      query,
      summary: {
        total: vaultItems.length,
        profileComplete: Math.min(100, Math.round((filledProfileFields / 18) * 100)),
        applications: applications.length,
        generated: generated.length,
        interviews: sessions.length,
        roadmaps: roadmaps.length,
        resumeVersions: resumeVersions.length,
      },
      keywords: extractKeywords(combinedText, 20),
      results,
      suggestions,
    },
  });
}
