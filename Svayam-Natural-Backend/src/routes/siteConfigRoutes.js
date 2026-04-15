import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  getAllConfigs,
  getConfigsByGroup,
  updateConfig,
  bulkUpdateConfigs,
  createConfig,
  deleteConfig,
} from '../controllers/siteConfigController.js';

const router = express.Router();

// Public — frontend reads these to render WhatsApp button, social links, etc.
router.get('/', getAllConfigs);
router.get('/group/:group', getConfigsByGroup);

// Admin only — CMS updates
router.post('/', protect, admin, createConfig);
router.put('/bulk', protect, admin, bulkUpdateConfigs);
router.put('/:key', protect, admin, updateConfig);
router.delete('/:key', protect, admin, deleteConfig);

export default router;
