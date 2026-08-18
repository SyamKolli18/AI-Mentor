import { Request, Response, NextFunction } from 'express';
import { CommunityForum, StudyGroup, ProjectShowcase, Achievement } from '../models/Community';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Internal award points helper
const awardPoints = async (userId: string, type: 'Coding Guru' | 'Consistency Champion' | 'Interview Ace' | 'Helper Hand', points: number) => {
  const ach = new Achievement({
    userId: new mongoose.Types.ObjectId(userId),
    badgeType: type,
    points,
    achievedAt: new Date()
  });
  await ach.save();
};

export const getForums = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let forums = await CommunityForum.find().sort({ createdAt: -1 });

    if (forums.length === 0) {
      // Seed initial forum topics
      const systemUser = await User.findOne({ role: 'admin' }) || { _id: new mongoose.Types.ObjectId(), name: 'System Coordinator' };
      
      forums = await CommunityForum.insertMany([
        {
          title: 'Tips for passing FAANG system design interviews',
          content: 'Keep load balancers, CDN routing, and Redis caching layers standard inside your layouts specifications. Focus on single points of failure.',
          category: 'Career',
          authorId: systemUser._id,
          authorName: systemUser.name,
          comments: [
            { authorId: new mongoose.Types.ObjectId(), authorName: 'Alice Johnson', content: 'Very helpful, thanks!', createdAt: new Date() }
          ],
          bookmarks: []
        },
        {
          title: 'Understanding React 19 async transitions and actions APIs',
          content: 'React 19 introduces direct handling of pending states in async updates. No need for custom loading flags.',
          category: 'Technical',
          authorId: systemUser._id,
          authorName: systemUser.name,
          comments: [],
          bookmarks: []
        }
      ]) as any;
    }

    res.status(200).json({
      status: 'success',
      forums
    });
  } catch (error) {
    next(error);
  }
};

export const createForum = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { title, content, category } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const forum = new CommunityForum({
      title,
      content,
      category: category || 'General',
      authorId: user._id,
      authorName: user.name,
      comments: [],
      bookmarks: []
    });

    await forum.save();

    // Reward points for posting forum topic
    await awardPoints(userId, 'Helper Hand', 10);

    res.status(201).json({
      status: 'success',
      forum
    });
  } catch (error) {
    next(error);
  }
};

export const commentForum = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { content } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const forum = await CommunityForum.findById(id);
    if (!forum) {
      throw new AppError('Forum thread not found', 404);
    }

    forum.comments.push({
      authorId: user._id,
      authorName: user.name,
      content,
      createdAt: new Date()
    });

    await forum.save();

    // Reward helper points for contributing answers
    await awardPoints(userId, 'Helper Hand', 5);

    res.status(200).json({
      status: 'success',
      forum
    });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let groups = await StudyGroup.find();

    if (groups.length === 0) {
      groups = await StudyGroup.insertMany([
        { name: 'Algorithm Solvers Club', description: 'Coordinating LeetCode weekly challenges solutions.', members: [], challengesCompleted: 24 },
        { name: 'Systems Architects', description: 'Discussing microservices, queue limits, and sharding guidelines.', members: [], challengesCompleted: 12 }
      ]) as any;
    }

    res.status(200).json({
      status: 'success',
      groups
    });
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const group = await StudyGroup.findById(id);
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    const isMember = group.members.some(m => m.toString() === userId);
    if (isMember) {
      // Leave group
      group.members = group.members.filter(m => m.toString() !== userId);
    } else {
      group.members.push(new mongoose.Types.ObjectId(userId));
      await awardPoints(userId, 'Consistency Champion', 15);
    }

    await group.save();

    res.status(200).json({
      status: 'success',
      message: isMember ? 'Left the study group.' : 'Joined the study group successfully!',
      group
    });
  } catch (error) {
    next(error);
  }
};

export const getShowcase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const showcases = await ProjectShowcase.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      showcases
    });
  } catch (error) {
    next(error);
  }
};

export const postShowcase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { title, description, repoUrl, liveUrl } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const showcase = new ProjectShowcase({
      title,
      description,
      repoUrl,
      liveUrl,
      authorId: user._id,
      authorName: user.name,
      likes: [],
      peerReviews: []
    });

    await showcase.save();

    // Reward portfolio badges
    await awardPoints(userId, 'Coding Guru', 20);

    res.status(201).json({
      status: 'success',
      showcase
    });
  } catch (error) {
    next(error);
  }
};

export const reviewShowcase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const showcase = await ProjectShowcase.findById(id);
    if (!showcase) {
      throw new AppError('Showcase portfolio post not found', 404);
    }

    showcase.peerReviews.push({
      reviewerId: user._id,
      reviewerName: user.name,
      rating: Number(rating) || 5,
      feedback,
      createdAt: new Date()
    });

    await showcase.save();

    // Reward points for reviewing peer projects
    await awardPoints(userId, 'Helper Hand', 15);

    res.status(200).json({
      status: 'success',
      showcase
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Aggregate points in Achievements grouping by userId
    const leaders = await Achievement.aggregate([
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' },
          badges: { $addToSet: '$badgeType' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 }
    ]);

    // Populate user profile names
    const populatedLeaders = await Promise.all(
      leaders.map(async (leader) => {
        const user = await User.findById(leader._id);
        return {
          userId: leader._id,
          name: user ? user.name : 'Learner',
          points: leader.totalPoints,
          badgesCount: leader.badges.length,
          badges: leader.badges
        };
      })
    );

    res.status(200).json({
      status: 'success',
      leaderboard: populatedLeaders
    });
  } catch (error) {
    next(error);
  }
};
