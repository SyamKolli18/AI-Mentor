import { Router } from 'express';
import { getCodingAnalytics, syncProblemSolved } from '../controllers/codingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth locks
router.use(authenticate as any);

router.get('/analytics', getCodingAnalytics as any);
router.post('/sync', syncProblemSolved as any);

export default router;
