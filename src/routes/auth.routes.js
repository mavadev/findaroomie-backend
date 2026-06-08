import { Router } from 'express';
import { registerUser, verifyEmail } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);

export default router;
