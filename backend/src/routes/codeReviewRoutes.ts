import { Router } from 'express';
import { submitCodeReview, getCodeReviewHistory } from '../controllers/codeReviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth protection
router.use(authenticate as any);

router.post('/submit', submitCodeReview as any);
router.get('/history', getCodeReviewHistory as any);

export default router;
