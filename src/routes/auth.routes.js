import { Router } from 'express';
import { registerUser, verifyEmail, loginUser } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);

export default router;
