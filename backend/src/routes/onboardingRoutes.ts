import { Router } from 'express';
import {
  getOnboarding,
  saveProgress,
  submitOnboarding,
} from '../controllers/onboardingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all onboarding routes
router.use(authenticate as any);

router.get('/', getOnboarding as any);
router.post('/save', saveProgress as any);
router.post('/submit', submitOnboarding as any);

export default router;
