import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getMe, updateMe, updatePreferences } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/preferences', protect, updatePreferences);

export default router;
