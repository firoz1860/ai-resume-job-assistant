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
import { cacheFor, invalidateUserCache } from '../middleware/cache.js';
import { optionalAuth, protect, requireAdmin } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/generate', optionalAuth, invalidateUserCache, generate);
router.post('/match', match);
router.get('/dashboard/stats', protect, cacheFor(30), asyncHandler(getDashboardStats));
router.get('/intelligence/overview', protect, cacheFor(45), asyncHandler(getCareerIntelligence));
router.post('/intelligence/inspect-job', protect, asyncHandler(inspectJobPost));
router.get('/career-vault/search', protect, cacheFor(30), asyncHandler(searchCareerVault));
router.get('/admin/stats', protect, requireAdmin, asyncHandler(getAdminStats));
router.post('/resume/parse', protect, upload.single('resume'), asyncHandler(parseResume));
router.post('/resume/apply-parsed', protect, invalidateUserCache, asyncHandler(applyParsedResume));
router.get('/resume/versions', protect, cacheFor(30), asyncHandler(listResumeVersions));
router.post('/resume/versions', protect, invalidateUserCache, asyncHandler(saveResumeVersion));
router.post('/resume/diff', protect, asyncHandler(resumeDiff));
router.post('/career/analyze', protect, invalidateUserCache, analyzeCareer);
router.post('/job/analyze', protect, invalidateUserCache, asyncHandler(analyzeJob));
router.post('/generate/content', optionalAuth, invalidateUserCache, generate);
router.get('/content/library', protect, cacheFor(30), asyncHandler(listGeneratedContent));
router.delete('/content/:id', protect, invalidateUserCache, asyncHandler(deleteGeneratedContent));
router.post('/interview/start', protect, invalidateUserCache, startInterview);
router.post('/interview/answer', protect, invalidateUserCache, answerInterview);
router.post('/interview/end', protect, invalidateUserCache, endInterview);
router.get('/interview/history', protect, cacheFor(20), interviewHistory);
router.get('/interview/:id', protect, cacheFor(20), interviewDetail);
router.post('/roadmap/create', protect, invalidateUserCache, asyncHandler(createRoadmap));
router.get('/applications', protect, cacheFor(30), asyncHandler(listApplications));
router.post('/applications', protect, invalidateUserCache, asyncHandler(createApplication));
router.put('/applications/:id', protect, invalidateUserCache, asyncHandler(updateApplication));
router.delete('/applications/:id', protect, invalidateUserCache, asyncHandler(deleteApplication));
router.post('/applications/:id/follow-up', protect, asyncHandler(followUp));

export default router;
