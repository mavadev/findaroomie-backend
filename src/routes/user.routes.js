import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import {
	getMe,
	updateMe,
	updatePreferences,
	updateProfileImage,
	changePassword,
	getUserPublicProfile,
} from '../controllers/user.controller.js';

const router = Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/preferences', protect, updatePreferences);
router.post('/me/profile-image', protect, uploadImage.single('profileImage'), updateProfileImage);
router.put('/me/password', protect, changePassword);
router.get('/:id/public-profile', getUserPublicProfile);

export default router;
