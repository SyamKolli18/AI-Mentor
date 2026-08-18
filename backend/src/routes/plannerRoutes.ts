import { Router } from 'express';
import {
  getPlanner,
  createTask,
  updateTaskStatus,
  toggleHabit,
  logFocusTime
} from '../controllers/plannerController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth protect guards
router.use(authenticate as any);

router.get('/tasks', getPlanner as any);
router.post('/tasks', createTask as any);
router.put('/tasks/:id', updateTaskStatus as any);
router.post('/habits', toggleHabit as any);
router.post('/focus', logFocusTime as any);

export default router;
