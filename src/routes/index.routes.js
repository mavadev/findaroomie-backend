import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API de FINDAROOMIE funcionando correctamente',
  });
});

export default router;