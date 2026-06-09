import { Router } from 'express';
import { getDistricts } from '../controllers/district.controller.js';

const router = Router();

router.get('/', getDistricts);

export default router;
