import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listChanges,
  getChangeById,
  markRead,
  markImportant,
  dismissChange,
  getDashboardSummary,
} from '../controllers/changeController';

const router = Router();
router.use(requireAuth);

router.get('/dashboard-summary', getDashboardSummary);
router.get('/', listChanges);
router.get('/:id', getChangeById);
router.patch('/:id/read', markRead);
router.patch('/:id/important', markImportant);
router.patch('/:id/dismiss', dismissChange);

export default router;
