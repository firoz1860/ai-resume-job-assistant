import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  answerVoiceInterview,
  endVoiceInterview,
  startVoiceInterview,
  voiceInterviewDetail,
  voiceInterviewHistory,
} from '../controllers/voiceInterviewController.js';

const router = Router();

router.use(protect);
router.post('/start', startVoiceInterview);
router.post('/answer', answerVoiceInterview);
router.post('/end', endVoiceInterview);
router.get('/history', voiceInterviewHistory);
router.get('/:id', voiceInterviewDetail);

export default router;
