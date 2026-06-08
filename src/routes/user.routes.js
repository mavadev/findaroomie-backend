import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { getMe, updateMe, updatePreferences, updateProfileImage } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/preferences', protect, updatePreferences);
router.put('/me/profile-image', protect, uploadImage.single('profileImage'), updateProfileImage);

export default router;
