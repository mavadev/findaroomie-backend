import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getIdentityVerifications,
  updateIdentityVerificationStatus,
  getAdminReports,
  updateReportStatus,
  getUsers,
  updateUserStatus,
  getRoomVerifications,
  updateRoomVerificationStatus,
} from '../controllers/admin.controller.js';

const router = Router();

// Nota: en un proyecto real se añadiría middleware isAdmin.
// Para el MVP usamos protect (requiere login).
router.get('/identity-verifications', protect, getIdentityVerifications);
router.patch('/identity-verifications/:id/status', protect, updateIdentityVerificationStatus);

router.get('/reports', protect, getAdminReports);
router.patch('/reports/:id/status', protect, updateReportStatus);

router.get('/users', protect, getUsers);
router.patch('/users/:id/status', protect, updateUserStatus);

router.get('/room-verifications', protect, getRoomVerifications);
router.patch('/room-verifications/:id/status', protect, updateRoomVerificationStatus);

export default router;
