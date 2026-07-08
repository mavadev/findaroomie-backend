import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import {
  createRoom,
  uploadRoomImages,
  getRooms,
  getMyRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  deleteRoomImage,
  submitRoomVerification,
} from '../controllers/room.controller.js';

const router = Router();

router.post('/', protect, createRoom);
router.post('/:id/images', protect, uploadImage.array('images', 6), uploadRoomImages);
router.delete('/:id/images/:publicId', protect, deleteRoomImage);
router.post('/:id/verification', protect, uploadImage.single('utilityBill'), submitRoomVerification);

router.get('/', getRooms);
router.get('/mine', protect, getMyRooms);
router.get('/:id', getRoomById);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);

export default router;
