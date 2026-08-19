import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  refreshToken,
  logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate as any, logout as any);
router.get('/me', authenticate as any, getMe as any);

export default router;
