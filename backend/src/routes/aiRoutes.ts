import { Router } from 'express';
import {
  analyzeProfile,
  getCareerRecommendations,
  generateRoadmap,
  getActiveRoadmap,
  reorderRoadmapModules,
  customiseRoadmapModule,
  completeLesson,
  completeProject,
  submitQuiz,
  getDashboardStats,
  saveWeeklyGoal,
  explainAndTeach,
  getPracticeQuestions,
  evaluateAnswer,
  getAdaptiveDecision,
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all AI/Roadmap routes
router.use(authenticate as any);

router.post('/analyze-profile', analyzeProfile as any);
router.post('/career-recommendations', getCareerRecommendations as any);
router.post('/generate-roadmap', generateRoadmap as any);
router.get('/roadmap', getActiveRoadmap as any);
router.post('/roadmap/reorder', reorderRoadmapModules as any);
router.post('/roadmap/customise', customiseRoadmapModule as any);

// Progress Analytics Extensions
router.post('/roadmap/complete-lesson', completeLesson as any);
router.post('/roadmap/complete-project', completeProject as any);
router.post('/roadmap/submit-quiz', submitQuiz as any);
router.get('/dashboard-stats', getDashboardStats as any);
router.post('/weekly-goal', saveWeeklyGoal as any);

// Phase E & G AI Learning System & Adaptive Engine routes
router.post('/learn/explain-teach', explainAndTeach as any);
router.post('/learn/practice', getPracticeQuestions as any);
router.post('/learn/evaluate', evaluateAnswer as any);
router.post('/learn/adaptive-decision', getAdaptiveDecision as any);

export default router;
