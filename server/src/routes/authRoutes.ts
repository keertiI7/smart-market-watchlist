import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  validateBody([
    { field: 'name', required: true, type: 'string' },
    { field: 'email', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string', minLength: 6 },
  ]),
  register
);

router.post(
  '/login',
  validateBody([
    { field: 'email', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' },
  ]),
  login
);

router.get('/me', requireAuth, me);

export default router;
