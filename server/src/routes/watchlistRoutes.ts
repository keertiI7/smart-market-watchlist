import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  listWatchlists,
  createWatchlist,
  renameWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
} from '../controllers/watchlistController';

const router = Router();
router.use(requireAuth);

router.get('/', listWatchlists);
router.post('/', validateBody([{ field: 'name', required: true, type: 'string' }]), createWatchlist);
router.patch('/:id', renameWatchlist);
router.delete('/:id', deleteWatchlist);

router.post(
  '/:id/stocks',
  validateBody([{ field: 'symbol', required: true, type: 'string' }]),
  addStockToWatchlist
);
router.delete('/:id/stocks/:symbol', removeStockFromWatchlist);

export default router;
