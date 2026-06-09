import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { createRoom, uploadRoomImages } from '../controllers/room.controller.js';

const router = Router();

router.post('/', protect, createRoom);
router.post('/:id/images', protect, uploadImage.array('images', 6), uploadRoomImages);

export default router;