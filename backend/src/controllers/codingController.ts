import { Request, Response, NextFunction } from 'express';
import { CodingPractice } from '../models/CodingPractice';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getCodingAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    let coding = await CodingPractice.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!coding) {
      // Mock coding parameters initial values
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      coding = new CodingPractice({
        userId: new mongoose.Types.ObjectId(userId),
        streakCount: 3,
        solvedEasy: 24,
        solvedMedium: 18,
        solvedHard: 5,
        contestRating: 1580,
        contestHistory: [
          { contestName: 'Weekly Contest 120', rank: 1450, rating: 1520 },
          { contestName: 'Weekly Contest 121', rank: 890, rating: 1580 }
        ],
        topicMastery: [
          { topicName: 'Recursion & Backtracking', questionsCount: 8, strengthIndex: 75 },
          { topicName: 'Dynamic Programming', questionsCount: 12, strengthIndex: 48 },
          { topicName: 'Trees & Graph Theory', questionsCount: 15, strengthIndex: 64 },
          { topicName: 'Systems Architecture', questionsCount: 6, strengthIndex: 70 },
          { topicName: 'SQL & Database Queries', questionsCount: 10, strengthIndex: 82 }
        ],
        activityHeatmap: [
          { date: twoDaysAgo, count: 2 },
          { date: yesterday, count: 4 },
          { date: today, count: 3 }
        ],
        revisionHistory: [
          { topicName: 'Dynamic Programming', revisedAt: yesterday }
        ]
      });
      await coding.save();
    }

    res.status(200).json({
      status: 'success',
      coding
    });
  } catch (error) {
    next(error);
  }
};

export const syncProblemSolved = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { difficulty, topicName, count } = req.body; // difficulty: 'Easy' | 'Medium' | 'Hard'

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!difficulty || !topicName) {
      throw new AppError('Difficulty level and topic identifier are required', 400);
    }

    const coding = await CodingPractice.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!coding) {
      throw new AppError('Coding practice log not initialized', 404);
    }

    const increment = count || 1;

    // 1. Difficulty Solved counters
    if (difficulty === 'Easy') coding.solvedEasy += increment;
    else if (difficulty === 'Medium') coding.solvedMedium += increment;
    else if (difficulty === 'Hard') coding.solvedHard += increment;

    // 2. Topic Mastery strength adjustment
    let topic = coding.topicMastery.find(t => t.topicName.toLowerCase().includes(topicName.toLowerCase()));
    if (topic) {
      topic.questionsCount += increment;
      // Increment strength rating slightly
      const weight = difficulty === 'Hard' ? 5 : difficulty === 'Medium' ? 3 : 1;
      topic.strengthIndex = Math.min(99, topic.strengthIndex + weight * increment);
    } else {
      coding.topicMastery.push({
        topicName,
        questionsCount: increment,
        strengthIndex: difficulty === 'Hard' ? 60 : difficulty === 'Medium' ? 55 : 50
      });
    }

    // 3. Heatmap point registration
    const today = new Date();
    today.setHours(0,0,0,0);
    let heatmapPoint = coding.activityHeatmap.find(pt => {
      const d = new Date(pt.date);
      d.setHours(0,0,0,0);
      return d.getTime() === today.getTime();
    });

    if (heatmapPoint) {
      heatmapPoint.count += increment;
    } else {
      coding.activityHeatmap.push({ date: new Date(), count: increment });
    }

    // 4. Streak adjustments
    coding.streakCount += 1; // increase streak simply by adding problem

    // Register revision log
    coding.revisionHistory.push({ topicName, revisedAt: new Date() });

    await coding.save();

    res.status(200).json({
      status: 'success',
      coding
    });
  } catch (error) {
    next(error);
  }
};
