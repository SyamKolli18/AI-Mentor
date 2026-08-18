import { Request, Response, NextFunction } from 'express';
import { StudyPlanner } from '../models/StudyPlanner';
import { StudyStatistics } from '../models/StudyStatistics';
import { WeeklyGoals } from '../models/WeeklyGoals';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Increments minutes in StudyStatistics and WeeklyGoals models
const syncStudyStats = async (userId: string, minutes: number) => {
  let stats = await StudyStatistics.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (stats) {
    stats.weeklyStudyMinutes += minutes;
    stats.monthlyStudyMinutes += minutes;
    
    // Log daily log for today
    const today = new Date();
    today.setHours(0,0,0,0);
    const log = stats.dailyLogs.find(l => {
      const d = new Date(l.date);
      d.setHours(0,0,0,0);
      return d.getTime() === today.getTime();
    });
    if (log) log.minutes += minutes;
    else stats.dailyLogs.push({ date: new Date(), minutes });
    
    await stats.save();
  }

  // Sync to WeeklyGoal
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0,0,0,0);
  const goal = await WeeklyGoals.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    weekStartDate: { $gte: startOfWeek },
    status: 'active'
  });
  if (goal) {
    goal.completedHours = Math.round((goal.completedHours + (minutes / 60)) * 10) / 10;
    await goal.save();
  }
};

export const getPlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    let planner = await StudyPlanner.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!planner) {
      planner = new StudyPlanner({
        userId: new mongoose.Types.ObjectId(userId),
        tasks: [
          {
            title: 'Solve DSA Binary Tree revision nodes',
            category: 'Practice',
            duration: 45,
            priority: 'High',
            status: 'pending',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
            adaptiveRecoveryActive: false
          },
          {
            title: 'Complete active Roadmap Lesson topic',
            category: 'Roadmap',
            duration: 30,
            priority: 'Medium',
            status: 'pending',
            dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
            adaptiveRecoveryActive: false
          }
        ],
        habits: [
          { name: 'Solve 1 algorithmic problem daily', frequency: 'daily', streak: 0, completedDates: [] },
          { name: 'Read technical official documentation (15m)', frequency: 'daily', streak: 0, completedDates: [] }
        ],
        focusConfig: { pomodoroDuration: 25, completedSessions: 0, focusStudyMinutes: 0 }
      });
      await planner.save();
    }

    res.status(200).json({
      status: 'success',
      planner
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { title, category, duration, priority, dueDate } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!title || !category || !dueDate) {
      throw new AppError('Title, category, and due date are required', 400);
    }

    const planner = await StudyPlanner.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!planner) {
      throw new AppError('Study planner not initialized', 404);
    }

    const newTask = {
      title,
      category,
      duration: duration || 30,
      priority: priority || 'Medium',
      status: 'pending' as const,
      dueDate: new Date(dueDate),
      adaptiveRecoveryActive: false
    };

    planner.tasks.push(newTask);
    await planner.save();

    res.status(201).json({
      status: 'success',
      task: planner.tasks[planner.tasks.length - 1],
      planner
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status, adaptiveRecoveryActive } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const planner = await StudyPlanner.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!planner) {
      throw new AppError('Study planner not initialized', 404);
    }

    const task = (planner.tasks as any).id(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const previousStatus = task.status;

    if (status) {
      task.status = status;
      
      // If task marked completed, sync study minutes
      if (status === 'completed' && previousStatus !== 'completed') {
        await syncStudyStats(userId, task.duration);
        
        // Accumulate WeeklyGoal completedLessons too if category is Roadmap
        if (task.category === 'Roadmap') {
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          startOfWeek.setHours(0,0,0,0);
          const goal = await WeeklyGoals.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            weekStartDate: { $gte: startOfWeek },
            status: 'active'
          });
          if (goal) {
            goal.completedLessonsCount += 1;
            await goal.save();
          }
        }
      }
    }

    if (adaptiveRecoveryActive !== undefined) {
      task.adaptiveRecoveryActive = adaptiveRecoveryActive;
      // Reschedule task for tomorrow if adaptive recovery triggered
      if (adaptiveRecoveryActive) {
        task.dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        task.status = 'pending';
      }
    }

    await planner.save();

    res.status(200).json({
      status: 'success',
      task,
      planner
    });
  } catch (error) {
    next(error);
  }
};

export const toggleHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { habitName } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const planner = await StudyPlanner.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!planner) {
      throw new AppError('Study planner not initialized', 404);
    }

    const habit = planner.habits.find(h => h.name === habitName);
    if (!habit) {
      throw new AppError('Habit not found', 404);
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const alreadyCompleted = habit.completedDates.some(d => {
      const comp = new Date(d);
      comp.setHours(0,0,0,0);
      return comp.getTime() === today.getTime();
    });

    if (alreadyCompleted) {
      // Toggle off / remove today's completion
      habit.completedDates = habit.completedDates.filter(d => {
        const comp = new Date(d);
        comp.setHours(0,0,0,0);
        return comp.getTime() !== today.getTime();
      });
      habit.streak = Math.max(0, habit.streak - 1);
    } else {
      habit.completedDates.push(new Date());
      habit.streak += 1;
      // Log minor study stats points (10 minutes) for positive reinforcement
      await syncStudyStats(userId, 10);
    }

    await planner.save();

    res.status(200).json({
      status: 'success',
      habit,
      planner
    });
  } catch (error) {
    next(error);
  }
};

export const logFocusTime = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { minutes } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!minutes || minutes <= 0) {
      throw new AppError('Valid focus minutes duration is required', 400);
    }

    const planner = await StudyPlanner.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!planner) {
      throw new AppError('Study planner not initialized', 404);
    }

    planner.focusConfig.focusStudyMinutes += minutes;
    planner.focusConfig.completedSessions += 1;
    await planner.save();

    // Sync focused minutes to standard stats logs
    await syncStudyStats(userId, minutes);

    res.status(200).json({
      status: 'success',
      focusConfig: planner.focusConfig,
      planner
    });
  } catch (error) {
    next(error);
  }
};
