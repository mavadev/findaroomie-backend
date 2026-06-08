import { Router } from 'express';
import { registerUser, verifyEmail, loginUser, resendVerificationCode } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/resend-verification-code', resendVerificationCode);

export default router;
