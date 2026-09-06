import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { searchStocks, getStockBySymbol } from '../controllers/stockController';

const router = Router();
router.use(requireAuth);

router.get('/search', searchStocks);
router.get('/:symbol', getStockBySymbol);

export default router;
