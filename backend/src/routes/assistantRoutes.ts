import { Router } from 'express';
import { handleChat, getSessions, toggleSaveSession, saveFavorite } from '../controllers/assistantController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure routes
router.use(authenticate as any);

router.post('/chat', handleChat as any);
router.get('/sessions', getSessions as any);
router.post('/sessions/:id/save', toggleSaveSession as any);
router.post('/sessions/:id/favorite', saveFavorite as any);

export default router;
