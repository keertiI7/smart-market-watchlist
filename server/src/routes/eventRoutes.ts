import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getEventsForSymbol } from '../controllers/eventController';

const router = Router();
router.use(requireAuth);

router.get('/:symbol', getEventsForSymbol);

export default router;
