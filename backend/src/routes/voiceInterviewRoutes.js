import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  answerVoiceInterview,
  endVoiceInterview,
  startVoiceInterview,
  voiceInterviewDetail,
  voiceInterviewHistory,
} from '../controllers/voiceInterviewController.js';
import { cacheFor, invalidateUserCache } from '../middleware/cache.js';

const router = Router();

router.use(protect);
router.post('/start', invalidateUserCache, startVoiceInterview);
router.post('/answer', invalidateUserCache, answerVoiceInterview);
router.post('/end', invalidateUserCache, endVoiceInterview);
router.get('/history', cacheFor(20), voiceInterviewHistory);
router.get('/:id', cacheFor(20), voiceInterviewDetail);

export default router;
