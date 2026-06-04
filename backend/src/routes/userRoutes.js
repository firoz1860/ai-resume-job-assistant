import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { cacheFor, invalidateUserCache } from '../middleware/cache.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/profile', protect, cacheFor(30), asyncHandler(getProfile));
router.put('/profile', protect, invalidateUserCache, asyncHandler(updateProfile));

export default router;
