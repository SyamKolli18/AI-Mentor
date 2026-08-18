import { Router } from 'express';
import {
  generateInterview,
  getInterviewSession,
  submitAnswer,
  completeInterview,
  getInterviewHistory
} from '../controllers/interviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth locks
router.use(authenticate as any);

router.post('/generate', generateInterview as any);
router.get('/history', getInterviewHistory as any);
router.get('/:id', getInterviewSession as any);
router.post('/:id/submit-answer', submitAnswer as any);
router.post('/:id/complete', completeInterview as any);

export default router;
