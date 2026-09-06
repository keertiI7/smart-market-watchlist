import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { simulate } from '../controllers/demoController';

const router = Router();
router.post('/simulate', requireAuth, simulate);

export default router;
