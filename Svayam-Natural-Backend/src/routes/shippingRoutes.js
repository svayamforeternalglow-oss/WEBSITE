import express from 'express';
import { trackOrder, createShipment, getShippingLabel, generateManifest } from '../controllers/shippingController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/track/:orderId', trackOrder);
router.post('/create/:orderId', protect, admin, createShipment);
router.get('/label/:orderId', protect, admin, getShippingLabel);
router.post('/manifest', protect, admin, generateManifest);

export default router;
