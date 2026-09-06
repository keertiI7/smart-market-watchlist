import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getQuote, getHistory, getIndices } from '../controllers/marketController';

const router = Router();
router.use(requireAuth);

router.get('/indices/summary', getIndices); // must come before /:symbol
router.get('/:symbol/history', getHistory);
router.get('/:symbol', getQuote);

export default router;