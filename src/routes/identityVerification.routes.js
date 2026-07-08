import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { createIdentityVerification } from '../controllers/identityVerification.controller.js';

const router = Router();

router.post(
	'/',
	protect,
	uploadImage.fields([
		{ name: 'dniFrontImage', maxCount: 1 },
		{ name: 'selfieWithDniImage', maxCount: 1 },
	]),
	createIdentityVerification,
);

export default router;
