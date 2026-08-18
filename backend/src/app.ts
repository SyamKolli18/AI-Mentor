import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { securityHeaders, rateLimiter, mongoSanitize } from './middleware/security';
import authRoutes from './routes/authRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import projectsRoutes from './routes/projectsRoutes';
import codeReviewRoutes from './routes/codeReviewRoutes';
import interviewRoutes from './routes/interviewRoutes';
import placementRoutes from './routes/placementRoutes';
import plannerRoutes from './routes/plannerRoutes';
import codingRoutes from './routes/codingRoutes';
import assistantRoutes from './routes/assistantRoutes';
import communityRoutes from './routes/communityRoutes';
import healthRoutes from './routes/healthRoutes';
import { env } from './config/env';

const app = express();

// Security / CORS configuration
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Apply Security Layers
app.use(securityHeaders);
app.use(rateLimiter);
app.use(mongoSanitize);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/code-review', codeReviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/health', healthRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
