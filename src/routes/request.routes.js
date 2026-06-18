import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createRequest, getSentRequests, getReceivedRequests, updateRequestStatus } from '../controllers/request.controller.js';

const router = Router();

router.post('/', protect, createRequest);
router.get('/sent', protect, getSentRequests);
router.get('/received', protect, getReceivedRequests);
router.patch('/:id/status', protect, updateRequestStatus);

export default router;
