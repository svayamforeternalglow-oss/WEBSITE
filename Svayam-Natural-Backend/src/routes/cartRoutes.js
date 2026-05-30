import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { upsertAbandonedCart, getRecoveryCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/abandoned', protect, upsertAbandonedCart);
router.get('/recovery/:token', getRecoveryCart);

export default router;
