import { dbState } from '../config/db.js';
import Application from '../models/Application.js';
import CareerProfile from '../models/CareerProfile.js';
import GeneratedContent from '../models/GeneratedContent.js';
import InterviewMessage from '../models/InterviewMessage.js';
import InterviewSession from '../models/InterviewSession.js';
import JobAnalysis from '../models/JobAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import { extractKeywords, overlapScore, titleCase } from '../utils/textAnalysis.js';

const RED_FLAG_TERMS = ['registration fee', 'security deposit', 'training fee', 'unpaid', 'urgent payment', 'whatsapp only', 'no interview', 'guaranteed job'];
const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'maybe', 'you know'];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function scoreAverage(values) {
  const nums = values.map(Number).filter(Number.isFinite);
  return nums.length ? Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length) : 0;
}

function firstFilled(...values) {
  return values.find((value) => String(value || '').trim()) || '';
}

function readinessScore({ profile, generatedCount, applicationsCount, interviewsCount, jobAnalysesCount, roadmapsCount }) {
  const checks = [
    { label: 'Profile saved', done: Boolean(profile?.skills || profile?.resumeText) },
    { label: 'Resume text available', done: Boolean(profile?.resumeText) },
    { label: 'Generated application content', done: generatedCount > 0 },
    { label: 'Analyzed job descriptions', done: jobAnalysesCount > 0 },
    { label: 'Practiced interviews', done: interviewsCount > 0 },
    { label: 'Tracked applications', done: applicationsCount > 0 },
    { label: 'Created roadmap', done: roadmapsCount > 0 },
  ];
  const score = Math.round((checks.filter((item) => item.done).length / checks.length) * 100);
  return { score, checks };
}

function buildSkillProjects(missingSkills, targetRole) {
  return missingSkills.slice(0, 5).map((skill) => ({
    skill,
    project: `Build a ${targetRole || 'career'} proof project that clearly uses ${skill}.`,
    proof: `Add one README section, one resume bullet, and one interview story proving ${skill}.`,
  }));
}

function applicationTimeline(applications) {
  return applications.slice(0, 8).map((item) => ({
    companyName: item.companyName || 'Company',
    role: item.role || 'Role',
    status: item.status || 'Saved',
    priority: item.priority || 'Medium',
    source: item.source || 'Unknown',
    followUpDate: item.followUpDate || '',
    lastContactDate: item.lastContactDate || '',
    nextAction: item.followUpDate && item.followUpDate <= new Date().toISOString().slice(0, 10)
      ? 'Send follow-up'
      : item.status === 'Interview'
        ? 'Prepare interview'
        : item.status === 'Saved'
          ? 'Tailor and apply'
          : 'Update status',
  }));
}

function resumeTailoringDiff(applications) {
  return applications
    .filter((item) => item.resumeBefore || item.resumeAfter || item.jobDescription)
    .slice(0, 5)
    .map((item) => {
      const before = extractKeywords(item.resumeBefore || '', 30);
      const after = extractKeywords(item.resumeAfter || '', 30);
      const added = after.filter((keyword) => !before.includes(keyword)).slice(0, 8).map(titleCase);
      return {
        companyName: item.companyName || 'Company',
        role: item.role || 'Role',
        before: item.resumeBefore || 'No original bullet saved.',
        after: item.resumeAfter || 'No tailored bullet saved.',
        addedKeywords: added,
        atsImpact: added.length ? `Added ${added.length} role-specific keyword${added.length === 1 ? '' : 's'}.` : 'Add before and after bullets to calculate impact.',
      };
    });
}

function applicationAnalytics(applications) {
  const applied = applications.filter((item) => ['Applied', 'Interview', 'Rejected', 'Offer'].includes(item.status)).length;
  const interviews = applications.filter((item) => ['Interview', 'Offer'].includes(item.status)).length;
  const offers = applications.filter((item) => item.status === 'Offer').length;
  const rejected = applications.filter((item) => item.status === 'Rejected').length;
  const sourceCounts = applications.reduce((map, item) => {
    const source = item.source || 'Unknown';
    map[source] = (map[source] || 0) + 1;
    return map;
  }, {});
  return {
    responseRate: applied ? Math.round((interviews / applied) * 100) : 0,
    offerRate: interviews ? Math.round((offers / interviews) * 100) : 0,
    rejectionRate: applied ? Math.round((rejected / applied) * 100) : 0,
    bestSource: Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not enough data',
  };
}

function rejectionPattern(applications) {
  const rejected = applications.filter((item) => item.status === 'Rejected');
  if (rejected.length < 2) return 'Not enough rejection data yet.';
  const noProof = rejected.filter((item) => !item.projectEvidence && !item.generatedContent && !item.resumeAfter).length;
  if (noProof >= Math.ceil(rejected.length / 2)) return 'Rejected applications often lack project proof or tailored content.';
  const noReferral = rejected.filter((item) => !item.recruiterName && !item.recruiterLinkedIn).length;
  if (noReferral >= Math.ceil(rejected.length / 2)) return 'Rejected applications often lack referral/contact activity.';
  return 'Review role fit, timing, and interview readiness for rejected applications.';
}

function contactNetwork(applications) {
  return applications
    .filter((item) => item.recruiterName || item.recruiterEmail || item.recruiterLinkedIn)
    .slice(0, 8)
    .map((item) => ({
      companyName: item.companyName || 'Company',
      role: item.role || 'Role',
      name: item.recruiterName || 'Contact not named',
      email: item.recruiterEmail || '',
      linkedIn: item.recruiterLinkedIn || '',
      lastContactDate: item.lastContactDate || '',
    }));
}

function proofScores(applications) {
  return applications.slice(0, 8).map((item) => {
    const text = [item.projectEvidence, item.resumeAfter, item.generatedContent, item.notes].join(' ').toLowerCase();
    const checks = [
      Boolean(item.projectEvidence),
      /\d|%|percent|users|reduced|increased|improved/.test(text),
      /react|node|mongodb|java|python|api|sql|aws|docker|express/.test(text),
      /built|launched|deployed|optimized|secured|automated|improved/.test(text),
    ];
    return {
      companyName: item.companyName || 'Company',
      role: item.role || 'Role',
      score: Math.round((checks.filter(Boolean).length / checks.length) * 100),
    };
  });
}

function speechAnalytics(messages) {
  const spoken = messages.filter((message) => message.role === 'user' && (message.transcript || message.answer));
  const words = spoken.flatMap((message) => String(message.transcript || message.answer || '').toLowerCase().split(/\s+/).filter(Boolean));
  const fillerCount = words.filter((word) => FILLER_WORDS.includes(word.replace(/[^\w]/g, ''))).length;
  const totalSpeakingSeconds = spoken.reduce((sum, message) => sum + (Number(message.speakingTimeSeconds) || 0), 0);
  const wordsPerMinute = totalSpeakingSeconds ? Math.round((words.length / totalSpeakingSeconds) * 60) : 0;
  const averageAnswerWords = spoken.length ? Math.round(words.length / spoken.length) : 0;

  return {
    answersAnalyzed: spoken.length,
    wordsPerMinute,
    averageAnswerWords,
    fillerCount,
    claritySignal: fillerCount <= 3 ? 'Clean' : fillerCount <= 8 ? 'Watch fillers' : 'Too many fillers',
  };
}

function momentReplay(messages) {
  return messages
    .filter((message) => message.role === 'ai' && (message.feedback || message.score))
    .slice(-6)
    .map((message) => ({
      question: message.question || message.nextQuestion || 'Interview question',
      score: message.score || 0,
      feedback: message.feedback || 'No feedback saved.',
      betterAnswer: message.betterAnswer || 'Practice a clearer answer with example, action, and result.',
      mistakes: safeArray(message.mistakes),
    }));
}

function timeline({ profile, applications, generated, interviews, roadmaps, jobAnalyses }) {
  const events = [
    profile?.createdAt && { type: 'Profile', title: 'Career profile created', date: profile.createdAt },
    ...generated.slice(0, 8).map((item) => ({ type: 'Content', title: item.contentType || 'Generated content', date: item.createdAt })),
    ...jobAnalyses.slice(0, 8).map((item) => ({ type: 'Job Match', title: item.targetRole || 'Job analyzed', date: item.createdAt })),
    ...roadmaps.slice(0, 8).map((item) => ({ type: 'Roadmap', title: item.targetRole || 'Roadmap created', date: item.createdAt })),
    ...applications.slice(0, 8).map((item) => ({ type: 'Application', title: `${item.companyName || 'Company'} - ${item.role || 'Role'}`, date: item.createdAt })),
    ...interviews.slice(0, 8).map((item) => ({ type: item.mode === 'voice' ? 'Voice Interview' : 'Interview', title: item.targetRole || 'Interview practice', date: item.createdAt })),
  ].filter(Boolean);

  return events.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 18);
}

function buildWeaknessPlan(interviews, messages) {
  const reportWeaknesses = interviews.flatMap((session) => safeArray(session.finalReport?.weaknesses));
  const messageMistakes = messages.flatMap((message) => safeArray(message.mistakes));
  const weaknesses = [...new Set([...reportWeaknesses, ...messageMistakes])].slice(0, 8);
  const fallback = ['Add measurable impact', 'Use STAR structure', 'Explain technical tradeoffs', 'Keep answers concise'];
  return (weaknesses.length ? weaknesses : fallback).map((weakness) => ({
    weakness,
    drill: `Practice 3 answers focused on: ${weakness}`,
    target: 'Record or type one improved answer and compare it with the better-answer feedback.',
  }));
}

function buildResumeVersions(generated, jobAnalyses) {
  const latestContent = generated.slice(0, 8).map((item) => ({
    id: String(item._id),
    type: item.contentType || 'Generated content',
    tone: item.tone || 'Default',
    createdAt: item.createdAt,
  }));
  const latestMatches = jobAnalyses.slice(0, 6).map((item) => ({
    targetRole: item.targetRole || 'Target role',
    targetCompany: item.targetCompany || 'Company',
    matchPercentage: item.result?.matchPercentage || 0,
    keywords: item.result?.resumeKeywordsToAdd || [],
  }));
  return { latestContent, latestMatches };
}

function buildJobSearchAgent(profile, applications, latestJobAnalysis) {
  const role = profile?.targetRole || applications[0]?.role || 'Full Stack Developer';
  const skills = extractKeywords([profile?.skills, profile?.resumeText, applications[0]?.jobDescription].filter(Boolean).join(' '), 8).map(titleCase);
  const missing = latestJobAnalysis?.missingSkills || [];
  return {
    targetRole: role,
    searchQueries: [
      `${role} fresher jobs`,
      `${role} internship remote`,
      `${role} ${skills.slice(0, 2).join(' ')}`.trim(),
      `site:linkedin.com/jobs ${role}`,
    ],
    dailyPlan: [
      applications.some((item) => item.followUpDate) ? 'Clear due follow-ups before applying to new roles.' : 'Apply to 3 high-match jobs.',
      contactNetwork(applications).length ? 'Follow up with existing recruiter contacts.' : 'Send 2 referral messages.',
      missing.length ? `Improve resume proof for ${missing.slice(0, 2).join(', ')}.` : 'Improve one resume bullet using the job description.',
      'Practice one weak interview question.',
    ],
  };
}

function buildBehavioralStories(profile, applications) {
  const project = firstFilled(profile?.projects, applications[0]?.projectEvidence, 'your strongest project');
  const achievement = firstFilled(profile?.achievements, applications[0]?.notes, 'a measurable result');
  return [
    { type: 'Project challenge', prompt: `Use ${project} to explain the challenge, your action, and result.` },
    { type: 'Teamwork', prompt: `Explain how you collaborated or handled feedback while working on ${project}.` },
    { type: 'Learning fast', prompt: `Describe how you learned a missing skill for ${profile?.targetRole || applications[0]?.role || 'your target role'}.` },
    { type: 'Impact story', prompt: `Use this proof point: ${achievement}. Convert it into a STAR answer.` },
  ];
}

function buildCompanyPrep(profile, applications) {
  const app = applications[0] || {};
  const targetCompany = profile?.dreamCompany || app.companyName || 'Target company';
  const role = profile?.targetRole || app.role || 'target role';
  const keywords = extractKeywords([app.jobDescription, app.companyResearch, app.notes].filter(Boolean).join(' '), 6).map(titleCase);
  return {
    targetCompany,
    prepTasks: [
      app.companyResearch || `Research ${targetCompany}'s product, customers, and recent work.`,
      `Prepare why you fit the ${role} role.`,
      keywords.length ? `Prepare examples for: ${keywords.join(', ')}.` : 'Map your projects to company problems.',
      app.recruiterName ? `Prepare a concise reply for ${app.recruiterName}.` : 'Prepare 3 questions for the interviewer.',
    ],
  };
}

function buildSalaryCoach(profile, applications) {
  const salary = profile?.expectedSalary || applications.find((item) => /salary|ctc|package/i.test(item.notes || ''))?.notes || 'a fair market-aligned offer';
  const notice = profile?.noticePeriod || 'my current availability';
  return {
    scripts: [
      `My expected compensation is flexible around ${salary}, depending on role scope and growth opportunity.`,
      `For joining timeline, ${notice} is my current position, and I can coordinate based on the process.`,
    ],
    negotiationChecklist: ['Know market range', 'Mention value and skills', 'Ask about full compensation structure'],
  };
}

function buildAutofillAnswers(profile, applications) {
  const app = applications[0] || {};
  return [
    `Notice period: ${profile?.noticePeriod || 'available based on the hiring timeline'}.`,
    `Expected salary: ${profile?.expectedSalary || 'flexible based on role scope and market range'}.`,
    `Preferred location: ${profile?.preferredLocation || app.location || 'open to discuss based on role requirements'}.`,
    `Availability: ${profile?.availability || app.lastContactDate || 'ready to coordinate with the recruitment process'}.`,
  ];
}

function buildReferralFinder(profile, applications) {
  const app = applications.find((item) => item.recruiterName || item.recruiterLinkedIn) || applications[0] || {};
  const company = profile?.dreamCompany || app.companyName || 'company';
  const role = profile?.targetRole || app.role || 'developer';
  return {
    searchQueries: [`${company} recruiter LinkedIn`, `${company} alumni ${role}`, `${company} hiring manager ${role}`],
    message: app.recruiterName
      ? `Hi ${app.recruiterName}, I am interested in the ${role} role at ${company}. I would be grateful for any guidance on the process.`
      : `Hi, I am exploring ${role} opportunities at ${company}. I would be grateful for any guidance or referral advice.`,
    contacts: contactNetwork(applications),
  };
}

function buildPortfolioAnalyzer(profile, applications) {
  const evidence = applications.map((item) => item.projectEvidence).filter(Boolean).join(' ');
  const projectKeywords = extractKeywords([profile?.projects, evidence].filter(Boolean).join(' '), 12).map(titleCase);
  return {
    projectKeywords,
    improvements: [
      evidence ? 'Convert saved project evidence into README proof sections.' : 'Add project evidence to applications.',
      profile?.githubUrl ? 'Keep GitHub pinned projects aligned with your target role.' : 'Add GitHub URL in profile.',
      profile?.portfolioUrl ? 'Add case studies to portfolio pages.' : 'Add a portfolio or live project link.',
    ],
  };
}

function buildReportCards({ readiness, interviewAverage, speech, applications }) {
  return [
    { label: 'Application Readiness', score: readiness.score, note: readiness.score >= 70 ? 'Ready for consistent applying.' : 'Complete profile, job match, and interview practice first.' },
    { label: 'Interview Strength', score: interviewAverage || 0, note: interviewAverage >= 70 ? 'Strong practice signal.' : 'Needs more scored interview sessions.' },
    { label: 'Voice Clarity', score: speech.answersAnalyzed ? Math.max(35, Math.min(100, 100 - speech.fillerCount * 5)) : 0, note: speech.claritySignal },
    { label: 'Pipeline Health', score: Math.min(100, applications.length * 20), note: `${applications.length} tracked applications.` },
  ];
}

function hasRedFlag(text, term) {
  if (!text.includes(term)) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const negated = new RegExp(`\\b(no|not|without|never)\\s+\\w*\\s*${escaped}\\b`, 'i');
  return !negated.test(text);
}

function analyzeJobPost(jobPost = '', profileText = '') {
  const text = jobPost.toLowerCase();
  const redFlags = RED_FLAG_TERMS.filter((term) => hasRedFlag(text, term));
  const match = jobPost.trim() && profileText.trim() ? overlapScore(profileText, jobPost) : null;
  return {
    scamRisk: redFlags.length >= 3 ? 'High' : redFlags.length ? 'Medium' : 'Low',
    redFlags,
    match,
    recommendation: redFlags.length ? 'Verify company, email domain, and payment requests before applying.' : 'No obvious red flags found. Still verify company and role details.',
  };
}

export async function getCareerIntelligence(req, res) {
  const userId = req.user._id;

  if (!dbState.isConnected) {
    return res.json({
      success: true,
      message: 'Career intelligence loaded from fallback mode.',
      data: { fallback: true, modules: [] },
    });
  }

  const [profile, applications, generated, interviews, roadmaps, jobAnalyses] = await Promise.all([
    CareerProfile.findOne({ userId }).lean(),
    Application.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    GeneratedContent.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    InterviewSession.find({ userId }).sort({ createdAt: -1 }).limit(60).lean(),
    Roadmap.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    JobAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  const sessionIds = interviews.map((session) => session._id);
  const messages = sessionIds.length ? await InterviewMessage.find({ userId, sessionId: { $in: sessionIds } }).sort({ createdAt: 1 }).lean() : [];
  const latestJobAnalysis = jobAnalyses[0]?.result;
  const profileText = [profile?.skills, profile?.projects, profile?.experience, profile?.resumeText].filter(Boolean).join(' ');
  const profileKeywords = extractKeywords(profileText, 18).map(titleCase);
  const missingSkills = latestJobAnalysis?.missingSkills || [];
  const readiness = readinessScore({
    profile,
    generatedCount: generated.length,
    applicationsCount: applications.length,
    interviewsCount: interviews.length,
    jobAnalysesCount: jobAnalyses.length,
    roadmapsCount: roadmaps.length,
  });
  const interviewAverage = scoreAverage(interviews.map((session) => session.overallScore));
  const speech = speechAnalytics(messages);

  const data = {
    careerVault: {
      targetRole: profile?.targetRole || applications[0]?.role || 'Not set',
      dreamCompany: profile?.dreamCompany || 'Not set',
      savedSkills: profileKeywords,
      assets: {
        generatedContent: generated.length,
        applications: applications.length,
        interviews: interviews.length,
        roadmaps: roadmaps.length,
        jobAnalyses: jobAnalyses.length,
      },
    },
    atsTailor: {
      latestMatchScore: latestJobAnalysis?.matchPercentage || 0,
      keywordsToAdd: latestJobAnalysis?.resumeKeywordsToAdd || missingSkills.slice(0, 8),
      summarySuggestion: latestJobAnalysis?.customResumeSummary || 'Run Job Analyzer to create job-specific ATS suggestions.',
    },
    explainableMatch: latestJobAnalysis || {
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: [],
      finalRecommendation: 'Paste a job description in Job Analyzer to unlock explainable matching.',
    },
    resumeVersions: buildResumeVersions(generated, jobAnalyses),
    autofillAnswers: buildAutofillAnswers(profile, applications),
    speechAnalytics: speech,
    interviewReplay: momentReplay(messages),
    companyPrep: buildCompanyPrep(profile, applications),
    behavioralStories: buildBehavioralStories(profile, applications),
    skillGapProjects: buildSkillProjects(missingSkills, profile?.targetRole),
    applicationTimeline: applicationTimeline(applications),
    resumeTailoringDiff: resumeTailoringDiff(applications),
    applicationAnalytics: applicationAnalytics(applications),
    rejectionPattern: rejectionPattern(applications),
    proofScores: proofScores(applications),
    applicationReadiness: readiness,
    salaryCoach: buildSalaryCoach(profile, applications),
    referralFinder: buildReferralFinder(profile, applications),
    jobSearchAgent: buildJobSearchAgent(profile, applications, latestJobAnalysis),
    portfolioAnalyzer: buildPortfolioAnalyzer(profile, applications),
    weaknessPractice: buildWeaknessPlan(interviews, messages),
    careerTimeline: timeline({ profile, applications, generated, interviews, roadmaps, jobAnalyses }),
    reportCards: buildReportCards({ readiness, interviewAverage, speech, applications }),
  };

  res.json({ success: true, message: 'Career intelligence loaded.', data });
}

export async function inspectJobPost(req, res) {
  const userId = req.user._id;
  const { jobPost = '' } = req.body;
  if (!jobPost.trim()) return res.status(400).json({ success: false, error: 'Job post text is required.' });

  const profile = dbState.isConnected ? await CareerProfile.findOne({ userId }).lean() : null;
  const profileText = [profile?.skills, profile?.projects, profile?.experience, profile?.resumeText].filter(Boolean).join(' ');
  res.json({ success: true, message: 'Job post inspected.', data: analyzeJobPost(jobPost, profileText) });
}
