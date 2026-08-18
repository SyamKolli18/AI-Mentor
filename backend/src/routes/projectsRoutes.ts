import { Router } from 'express';
import {
  getRecommendations,
  saveProject,
  bookmarkProject,
  updateProgress,
  uploadProjectDetails
} from '../controllers/projectsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all project endpoints
router.use(authenticate as any);

router.get('/recommendations', getRecommendations as any);
router.post('/:id/save', saveProject as any);
router.post('/:id/bookmark', bookmarkProject as any);
router.post('/:id/progress', updateProgress as any);
router.post('/:id/upload', uploadProjectDetails as any);

export default router;
