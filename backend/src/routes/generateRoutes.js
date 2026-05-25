import { Router } from 'express';
import { generate } from '../controllers/generateController.js';
import { match } from '../controllers/matchController.js';

const router = Router();

router.post('/generate', generate);
router.post('/match', match);

export default router;
