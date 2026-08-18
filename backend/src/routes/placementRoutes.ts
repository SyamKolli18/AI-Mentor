import { Router } from 'express';
import { getPlacementReadiness, forceRecalculateReadiness } from '../controllers/placementController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply session authentication
router.use(authenticate as any);

router.get('/readiness', getPlacementReadiness as any);
router.post('/recalculate', forceRecalculateReadiness as any);

export default router;
