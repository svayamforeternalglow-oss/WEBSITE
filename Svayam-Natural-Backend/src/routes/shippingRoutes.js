import express from 'express';
import { trackOrder, createShipment, getShippingLabel, getShippingInvoice, generateManifest } from '../controllers/shippingController.js';
import { protect, optionalProtect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/track/:orderId', optionalProtect, trackOrder);
router.post('/create/:orderId', protect, admin, createShipment);
router.get('/label/:orderId', protect, admin, getShippingLabel);
router.get('/invoice/:orderId', protect, admin, getShippingInvoice);
router.post('/manifest', protect, admin, generateManifest);

export default router;
