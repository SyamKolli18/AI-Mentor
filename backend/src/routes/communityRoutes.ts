import { Router } from 'express';
import {
  getForums,
  createForum,
  commentForum,
  getGroups,
  joinGroup,
  getShowcase,
  postShowcase,
  reviewShowcase,
  getLeaderboard
} from '../controllers/communityController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth locks
router.use(authenticate as any);

router.get('/forums', getForums as any);
router.post('/forums', createForum as any);
router.post('/forums/:id/comment', commentForum as any);

router.get('/groups', getGroups as any);
router.post('/groups/join', joinGroup as any);

router.get('/showcase', getShowcase as any);
router.post('/showcase', postShowcase as any);
router.post('/showcase/:id/review', reviewShowcase as any);

router.get('/leaderboard', getLeaderboard as any);

export default router;
