import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Roadmap } from '../models/Roadmap';
import { AIService } from '../utils/aiService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { RoadmapProgress } from '../models/RoadmapProgress';
import { StudyStatistics } from '../models/StudyStatistics';
import { WeeklyGoals } from '../models/WeeklyGoals';

export const analyzeProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isOnboarded) {
      throw new AppError('Please complete onboarding before analyzing profile', 400);
    }

    const aiProfile = await AIService.analyzeProfile(user);
    
    // Save to user document
    user.aiProfile = aiProfile;
    await user.save();

    res.status(200).json({
      status: 'success',
      aiProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getCareerRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Force analysis first if not analyzed yet
    if (!user.aiProfile) {
      user.aiProfile = await AIService.analyzeProfile(user);
    }

    const recommendations = await AIService.getCareerRecommendations(user, user.aiProfile);
    
    // Save to user document
    user.careerRecommendations = recommendations;
    await user.save();

    res.status(200).json({
      status: 'success',
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const generateRoadmap = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const { targetCareer } = req.body;
    if (!targetCareer) {
      throw new AppError('Target Career is required to generate roadmap', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Deactivate previous active roadmaps
    await Roadmap.updateMany({ userId: new mongoose.Types.ObjectId(userId), active: true }, { active: false });

    // Determine target version
    const lastRoadmap = await Roadmap.findOne({ userId: new mongoose.Types.ObjectId(userId) }).sort({ version: -1 });
    const nextVersion = lastRoadmap ? lastRoadmap.version + 1 : 1;

    // Generate roadmap module tree
    const modules = await AIService.generateRoadmap(user, targetCareer);

    // Save to Roadmap collection
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(userId),
      targetCareer,
      version: nextVersion,
      modules,
      active: true
    });

    await roadmap.save();

    // Reset progress tracking logs for the new active roadmap
    await RoadmapProgress.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });

    res.status(201).json({
      status: 'success',
      message: 'Roadmap generated successfully.',
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveRoadmap = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const roadmap = await Roadmap.findOne({ userId: new mongoose.Types.ObjectId(userId), active: true });
    
    res.status(200).json({
      status: 'success',
      roadmap: roadmap || null
    });
  } catch (error) {
    next(error);
  }
};

export const reorderRoadmapModules = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { moduleOrders } = req.body; // Array of { id: string, order: number }

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!Array.isArray(moduleOrders)) {
      throw new AppError('Invalid modules ordering request', 400);
    }

    const roadmap = await Roadmap.findOne({ userId: new mongoose.Types.ObjectId(userId), active: true });
    if (!roadmap) {
      throw new AppError('Active roadmap not found', 404);
    }

    // Reorder modules based on incoming array
    moduleOrders.forEach((item: { id: string, order: number }) => {
      const targetMod = roadmap.modules.find(m => m.id === item.id);
      if (targetMod) {
        targetMod.order = item.order;
      }
    });

    // Re-sort array based on order
    roadmap.modules.sort((a, b) => a.order - b.order);

    await roadmap.save();

    res.status(200).json({
      status: 'success',
      message: 'Roadmap modules re-ordered successfully.',
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

export const customiseRoadmapModule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { moduleId, title, description, status } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!moduleId) {
      throw new AppError('Module ID is required to customise module details', 400);
    }

    const roadmap = await Roadmap.findOne({ userId: new mongoose.Types.ObjectId(userId), active: true });
    if (!roadmap) {
      throw new AppError('Active roadmap not found', 404);
    }

    const targetMod = roadmap.modules.find(m => m.id === moduleId);
    if (!targetMod) {
      throw new AppError('Roadmap Module not found', 404);
    }

    if (title) targetMod.title = title;
    if (description) targetMod.description = description;
    if (status) targetMod.status = status;

    await roadmap.save();

    res.status(200).json({
      status: 'success',
      message: 'Module details updated successfully.',
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

// --- Part 4: Progress Analytics endpoints ---

const updateStudyMinutes = async (userId: string, minutes: number) => {
  let stats = await StudyStatistics.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (!stats) {
    stats = new StudyStatistics({
      userId: new mongoose.Types.ObjectId(userId),
      streakCount: 1,
      lastActiveDate: new Date(),
      weeklyStudyMinutes: 0,
      monthlyStudyMinutes: 0,
      dailyLogs: []
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null;
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastActive.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      stats.streakCount += 1;
    } else if (diffDays > 1) {
      stats.streakCount = 1;
    }
  } else {
    stats.streakCount = 1;
  }

  stats.lastActiveDate = new Date();

  // Find daily log for today
  let dailyLog = stats.dailyLogs.find(l => {
    const logDate = new Date(l.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });

  if (dailyLog) {
    dailyLog.minutes += minutes;
  } else {
    stats.dailyLogs.push({ date: new Date(), minutes });
  }

  stats.weeklyStudyMinutes += minutes;
  stats.monthlyStudyMinutes += minutes;
  await stats.save();

  // Also update active weekly goals completedHours
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const goal = await WeeklyGoals.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    weekStartDate: { $gte: startOfWeek },
    status: 'active'
  });
  if (goal) {
    goal.completedHours = Math.round((goal.completedHours + (minutes / 60)) * 10) / 10;
    if (goal.completedHours >= goal.goalHours && goal.completedLessonsCount >= goal.targetLessons) {
      goal.status = 'completed';
    }
    await goal.save();
  }
};

const incrementWeeklyGoalLessons = async (userId: string) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const goal = await WeeklyGoals.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    weekStartDate: { $gte: startOfWeek },
    status: 'active'
  });
  if (goal) {
    goal.completedLessonsCount += 1;
    if (goal.completedHours >= goal.goalHours && goal.completedLessonsCount >= goal.targetLessons) {
      goal.status = 'completed';
    }
    await goal.save();
  }
};

export const completeLesson = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { roadmapId, moduleId, topicIndex, lessonIndex, isCompleted } = req.body;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: new mongoose.Types.ObjectId(userId) });
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }
    const targetModule = roadmap.modules.find(m => m.id === moduleId);
    if (!targetModule) {
      throw new AppError('Module not found', 404);
    }
    const targetTopic = targetModule.topics[topicIndex];
    if (!targetTopic) {
      throw new AppError('Topic not found', 404);
    }
    const targetLesson = targetTopic.lessons[lessonIndex];
    if (!targetLesson) {
      throw new AppError('Lesson not found', 404);
    }

    targetLesson.isCompleted = isCompleted;

    // Recalculate module completion percentage
    let totalLessons = 0;
    let completedLessons = 0;
    targetModule.topics.forEach(t => {
      t.lessons.forEach(l => {
        totalLessons++;
        if (l.isCompleted) completedLessons++;
      });
    });
    targetModule.completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    if (targetModule.completionPercentage === 100) {
      targetModule.status = 'completed';
      // Unlock next module
      const nextMod = roadmap.modules.find(m => m.order === targetModule.order + 1);
      if (nextMod && nextMod.status === 'locked') {
        nextMod.status = 'unlocked';
      }
    } else if (targetModule.completionPercentage > 0) {
      targetModule.status = 'in-progress';
    } else {
      targetModule.status = 'unlocked';
    }

    await roadmap.save();

    // Track in RoadmapProgress
    const lessonKey = `${moduleId}_topic-${topicIndex}_lesson-${lessonIndex}`;
    let progress = await RoadmapProgress.findOne({ userId: new mongoose.Types.ObjectId(userId), roadmapId: new mongoose.Types.ObjectId(roadmapId) });
    if (!progress) {
      progress = new RoadmapProgress({
        userId: new mongoose.Types.ObjectId(userId),
        roadmapId: new mongoose.Types.ObjectId(roadmapId),
        completedLessons: [],
        completedProjects: [],
        quizScores: []
      });
    }

    if (isCompleted) {
      if (!progress.completedLessons.includes(lessonKey)) {
        progress.completedLessons.push(lessonKey);
      }
    } else {
      progress.completedLessons = progress.completedLessons.filter(k => k !== lessonKey);
    }

    // Recalculate overall roadmap percentage
    let totalRoadmapLessons = 0;
    let completedRoadmapLessons = 0;
    roadmap.modules.forEach(m => {
      m.topics.forEach(t => {
        t.lessons.forEach(l => {
          totalRoadmapLessons++;
          if (l.isCompleted) completedRoadmapLessons++;
        });
      });
    });
    progress.completionPercentage = totalRoadmapLessons > 0 ? Math.round((completedRoadmapLessons / totalRoadmapLessons) * 100) : 0;
    await progress.save();

    // Update study statistics
    if (isCompleted) {
      await updateStudyMinutes(userId, 30);
      await incrementWeeklyGoalLessons(userId);
    }

    res.status(200).json({
      status: 'success',
      roadmap,
      progress
    });
  } catch (error) {
    next(error);
  }
};

export const completeProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { roadmapId, moduleId, projectType, isCompleted } = req.body;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: new mongoose.Types.ObjectId(userId) });
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }
    const targetModule = roadmap.modules.find(m => m.id === moduleId);
    if (!targetModule) {
      throw new AppError('Module not found', 404);
    }

    // Update in RoadmapProgress
    let progress = await RoadmapProgress.findOne({ userId: new mongoose.Types.ObjectId(userId), roadmapId: new mongoose.Types.ObjectId(roadmapId) });
    if (!progress) {
      progress = new RoadmapProgress({
        userId: new mongoose.Types.ObjectId(userId),
        roadmapId: new mongoose.Types.ObjectId(roadmapId),
        completedLessons: [],
        completedProjects: [],
        quizScores: []
      });
    }

    const projKey = `${moduleId}_${projectType}`;
    if (isCompleted) {
      if (!progress.completedProjects.includes(projKey)) {
        progress.completedProjects.push(projKey);
      }
    } else {
      progress.completedProjects = progress.completedProjects.filter(p => p !== projKey);
    }
    await progress.save();

    // Increment Career Readiness Score for user!
    const user = await User.findById(userId);
    if (user && user.aiProfile) {
      const increment = projectType === 'major' ? 12 : 5;
      if (isCompleted) {
        user.aiProfile.scores.careerReadinessScore = Math.min(99, user.aiProfile.scores.careerReadinessScore + increment);
        user.aiProfile.scores.devReadiness = Math.min(99, user.aiProfile.scores.devReadiness + increment);
      } else {
        user.aiProfile.scores.careerReadinessScore = Math.max(10, user.aiProfile.scores.careerReadinessScore - increment);
        user.aiProfile.scores.devReadiness = Math.max(10, user.aiProfile.scores.devReadiness - increment);
      }
      await user.save();
    }

    // Add study minutes
    if (isCompleted) {
      await updateStudyMinutes(userId, projectType === 'major' ? 180 : 60);
    }

    res.status(200).json({
      status: 'success',
      roadmap,
      progress,
      careerReadinessScore: user?.aiProfile?.scores?.careerReadinessScore || 0
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { roadmapId, moduleId, score, totalQuestions } = req.body;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    let progress = await RoadmapProgress.findOne({ userId: new mongoose.Types.ObjectId(userId), roadmapId: new mongoose.Types.ObjectId(roadmapId) });
    if (!progress) {
      progress = new RoadmapProgress({
        userId: new mongoose.Types.ObjectId(userId),
        roadmapId: new mongoose.Types.ObjectId(roadmapId),
        completedLessons: [],
        completedProjects: [],
        quizScores: []
      });
    }

    // Add score to array
    progress.quizScores.push({
      moduleId,
      score,
      totalQuestions,
      completedAt: new Date()
    });
    await progress.save();

    // Check pass score
    const passed = (score / totalQuestions) >= 0.5;

    // Log study statistics
    await updateStudyMinutes(userId, 15);

    res.status(200).json({
      status: 'success',
      passed,
      score,
      totalQuestions,
      progress
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    // Study statistics
    let stats = await StudyStatistics.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!stats) {
      stats = new StudyStatistics({
        userId: new mongoose.Types.ObjectId(userId),
        streakCount: 1,
        weeklyStudyMinutes: 30, // initial study log
        monthlyStudyMinutes: 30,
        dailyLogs: [{ date: new Date(), minutes: 30 }]
      });
      await stats.save();
    }

    // Active Weekly Goal
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let goal = await WeeklyGoals.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      weekStartDate: { $gte: startOfWeek },
      status: 'active'
    });

    if (!goal) {
      goal = new WeeklyGoals({
        userId: new mongoose.Types.ObjectId(userId),
        goalHours: 10,
        completedHours: 0.5,
        targetLessons: 5,
        completedLessonsCount: 1,
        weekStartDate: startOfWeek,
        status: 'active'
      });
      await goal.save();
    }

    // Roadmap Completed vs Remaining modules
    const activeRoadmap = await Roadmap.findOne({ userId: new mongoose.Types.ObjectId(userId), active: true });
    let completedModules = 0;
    let remainingModules = 0;
    if (activeRoadmap) {
      activeRoadmap.modules.forEach(m => {
        if (m.status === 'completed') {
          completedModules++;
        } else {
          remainingModules++;
        }
      });
    }

    const user = await User.findById(userId);

    res.status(200).json({
      status: 'success',
      stats: {
        streakCount: stats.streakCount,
        totalStudyHours: Math.round((stats.weeklyStudyMinutes + stats.monthlyStudyMinutes) / 60 * 10) / 10,
        weeklyStudyMinutes: stats.weeklyStudyMinutes,
        monthlyStudyMinutes: stats.monthlyStudyMinutes,
        dailyLogs: stats.dailyLogs
      },
      goal,
      modules: {
        completed: completedModules,
        remaining: remainingModules
      },
      careerReadiness: user?.aiProfile?.scores?.careerReadinessScore || 0,
      estimatedCompletionDate: user?.aiProfile?.timelineEstimate?.estimatedCompletionDate || null
    });
  } catch (error) {
    next(error);
  }
};

export const saveWeeklyGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { goalHours, targetLessons } = req.body;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let goal = await WeeklyGoals.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      weekStartDate: { $gte: startOfWeek },
      status: 'active'
    });

    if (goal) {
      goal.goalHours = goalHours;
      goal.targetLessons = targetLessons;
      await goal.save();
    } else {
      goal = new WeeklyGoals({
        userId: new mongoose.Types.ObjectId(userId),
        goalHours,
        targetLessons,
        completedHours: 0,
        completedLessonsCount: 0,
        weekStartDate: startOfWeek,
        status: 'active'
      });
      await goal.save();
    }

    res.status(200).json({
      status: 'success',
      goal
    });
  } catch (error) {
    next(error);
  }
};

export const explainAndTeach = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { topicTitle, moduleTitle } = req.body;
    if (!userId) throw new AppError('Unauthorized access', 401);
    if (!topicTitle) throw new AppError('topicTitle is required', 400);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const result = await AIService.explainAndTeachTopic(user, topicTitle, moduleTitle || 'Learning Module');
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPracticeQuestions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { topicTitle } = req.body;
    if (!userId) throw new AppError('Unauthorized access', 401);
    if (!topicTitle) throw new AppError('topicTitle is required', 400);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const result = await AIService.generatePracticeQuestions(user, topicTitle);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const evaluateAnswer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { question, studentAnswer } = req.body;
    if (!userId) throw new AppError('Unauthorized access', 401);
    if (!question || !studentAnswer) throw new AppError('question and studentAnswer are required', 400);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const result = await AIService.evaluateStudentAnswer(user, question, studentAnswer);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdaptiveDecision = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { topicTitle, quizScore, totalQuestions } = req.body;
    if (!userId) throw new AppError('Unauthorized access', 401);
    if (!topicTitle) throw new AppError('topicTitle is required', 400);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const result = await AIService.determineAdaptiveNextAction(user, topicTitle, quizScore, totalQuestions);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
