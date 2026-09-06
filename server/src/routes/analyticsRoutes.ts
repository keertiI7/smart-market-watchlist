import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getAnalyticsOverview } from '../controllers/analyticsController';

const router = Router();
router.use(requireAuth);

router.get('/overview', getAnalyticsOverview);

export default router;