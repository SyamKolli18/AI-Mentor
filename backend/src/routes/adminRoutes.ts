import { Router } from 'express';
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  getCategories,
  createCategory,
  deleteCategory,
  getAdminAnalytics
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// Apply auth & role checking middleware to all Admin routes
router.use(authenticate as any);
router.use(authorize(['admin']) as any);

router.get('/resources', getResources);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/analytics', getAdminAnalytics as any);

export default router;
