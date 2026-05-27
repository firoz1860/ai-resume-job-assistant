import { Router } from 'express';
import { generate } from '../controllers/generateController.js';
import { match } from '../controllers/matchController.js';
import { analyzeCareer } from '../controllers/careerController.js';
import { analyzeJob } from '../controllers/jobAnalyzerController.js';
import { answerInterview, endInterview, interviewDetail, interviewHistory, startInterview } from '../controllers/interviewController.js';
import { createRoadmap } from '../controllers/roadmapController.js';
import { createApplication, deleteApplication, followUp, listApplications, updateApplication } from '../controllers/applicationController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { deleteGeneratedContent, listGeneratedContent } from '../controllers/contentController.js';
import { getCareerIntelligence, inspectJobPost } from '../controllers/intelligenceController.js';
import { searchCareerVault } from '../controllers/careerVaultController.js';
import { getAdminStats } from '../controllers/adminController.js';
import { applyParsedResume, listResumeVersions, parseResume, resumeDiff, saveResumeVersion } from '../controllers/resumeController.js';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/generate', optionalAuth, generate);
router.post('/match', match);
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));
router.get('/intelligence/overview', protect, asyncHandler(getCareerIntelligence));
router.post('/intelligence/inspect-job', protect, asyncHandler(inspectJobPost));
router.get('/career-vault/search', protect, asyncHandler(searchCareerVault));
router.get('/admin/stats', protect, asyncHandler(getAdminStats));
router.post('/resume/parse', protect, upload.single('resume'), asyncHandler(parseResume));
router.post('/resume/apply-parsed', protect, asyncHandler(applyParsedResume));
router.get('/resume/versions', protect, asyncHandler(listResumeVersions));
router.post('/resume/versions', protect, asyncHandler(saveResumeVersion));
router.post('/resume/diff', protect, asyncHandler(resumeDiff));
router.post('/career/analyze', protect, analyzeCareer);
router.post('/job/analyze', protect, asyncHandler(analyzeJob));
router.post('/generate/content', optionalAuth, generate);
router.get('/content/library', protect, asyncHandler(listGeneratedContent));
router.delete('/content/:id', protect, asyncHandler(deleteGeneratedContent));
router.post('/interview/start', protect, startInterview);
router.post('/interview/answer', protect, answerInterview);
router.post('/interview/end', protect, endInterview);
router.get('/interview/history', protect, interviewHistory);
router.get('/interview/:id', protect, interviewDetail);
router.post('/roadmap/create', protect, asyncHandler(createRoadmap));
router.get('/applications', protect, asyncHandler(listApplications));
router.post('/applications', protect, asyncHandler(createApplication));
router.put('/applications/:id', protect, asyncHandler(updateApplication));
router.delete('/applications/:id', protect, asyncHandler(deleteApplication));
router.post('/applications/:id/follow-up', protect, asyncHandler(followUp));

export default router;
