import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { createReport, getReports } from '../controllers/report.controller.js';

const router = Router();

router.post('/', protect, uploadImage.single('evidence'), createReport);
router.get('/', protect, getReports);

export default router;
