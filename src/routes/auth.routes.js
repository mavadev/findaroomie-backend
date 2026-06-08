import { Router } from 'express';
import {
	registerUser,
	verifyEmail,
	loginUser,
	resendVerificationCode,
	forgotPassword,
	resetPassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
