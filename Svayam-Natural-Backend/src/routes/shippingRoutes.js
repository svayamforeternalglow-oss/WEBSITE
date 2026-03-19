import express from 'express';
import { trackOrder, createShipment } from '../controllers/shippingController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/track/:orderId', trackOrder);
router.post('/create/:orderId', protect, admin, createShipment);

export default router;
