import { Request, Response, NextFunction } from 'express';
import { LearningResource } from '../models/LearningResource';
import { ResourceCategory } from '../models/ResourceCategory';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export const getResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, difficulty, careerPath } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (careerPath) filter.careerPaths = careerPath;

    const resources = await LearningResource.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: resources.length,
      resources
    });
  } catch (error) {
    next(error);
  }
};

export const createResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, difficulty, estimatedTime, externalUrl, category, resourceType, tags, careerPaths } = req.body;
    
    if (!title || !description || !difficulty || !estimatedTime || !externalUrl || !category || !resourceType) {
      throw new AppError('Missing required learning resource fields', 400);
    }

    const resource = new LearningResource({
      title,
      description,
      difficulty,
      estimatedTime,
      externalUrl,
      category,
      resourceType,
      tags: tags || [],
      careerPaths: careerPaths || []
    });

    await resource.save();

    res.status(201).json({
      status: 'success',
      resource
    });
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const resource = await LearningResource.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }

    res.status(200).json({
      status: 'success',
      resource
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const resource = await LearningResource.findByIdAndDelete(id);
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await ResourceCategory.find().sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      categories
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    const category = new ResourceCategory({ name, description });
    await category.save();

    res.status(201).json({
      status: 'success',
      category
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await ResourceCategory.findByIdAndDelete(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Aggregation calls to check database collection document counts
    const totalResources = await LearningResource.countDocuments();
    const totalCategories = await ResourceCategory.countDocuments();
    
    // Querying User counts
    const UserSchemaModel = mongoose.model('User');
    const totalUsers = await UserSchemaModel.countDocuments();
    const onboardedUsers = await UserSchemaModel.countDocuments({ isOnboarded: true });

    // AI queries
    const RoadmapProgressModel = mongoose.model('RoadmapProgress');
    const activeRoadmaps = await RoadmapProgressModel.countDocuments();

    // Mock interviews count
    const MockInterviewModel = mongoose.model('MockInterview');
    const totalInterviews = await MockInterviewModel.countDocuments();

    // Code reviews count
    const CodeReviewModel = mongoose.model('CodeReview');
    const totalCodeReviews = await CodeReviewModel.countDocuments();

    // Platform user growth list mock stats
    const userGrowth = [
      { month: 'January', users: 120 },
      { month: 'February', users: 240 },
      { month: 'March', users: 480 },
      { month: 'April', users: 950 },
      { month: 'May', users: 1800 },
      { month: 'June', users: totalUsers }
    ];

    // Audit logs mock records
    const auditLogs = [
      { timestamp: new Date(Date.now() - 5 * 60000), action: 'USER_VERIFY', details: 'User verified email successfully.' },
      { timestamp: new Date(Date.now() - 15 * 60000), action: 'ROADMAP_GENERATE', details: 'AI Roadmap compiled for new student.' },
      { timestamp: new Date(Date.now() - 45 * 60000), action: 'ADMIN_RESOURCE_CREATE', details: 'Admin uploaded new DSA learning video.' }
    ];

    // Error monitoring logs simulated records
    const errorLogs = [
      { id: 'ERR_SMTP_CONN', count: 3, message: 'SMTP handshake timeout on mail delivery.' },
      { id: 'ERR_MONGO_POOL', count: 1, message: 'Max clients limit warning in connection pool.' }
    ];

    // AI Usage analytics
    const aiUsage = [
      { name: 'Roadmap Generation', count: activeRoadmaps },
      { name: 'Code Audits', count: totalCodeReviews },
      { name: 'Mock Sessions', count: totalInterviews }
    ];

    res.status(200).json({
      status: 'success',
      analytics: {
        totalUsers,
        onboardedUsers,
        totalResources,
        totalCategories,
        activeRoadmaps,
        totalInterviews,
        totalCodeReviews,
        userGrowth,
        auditLogs,
        errorLogs,
        aiUsage,
        featureFlags: {
          voiceInterviewMode: true,
          liveChatConnector: false,
          communityForums: true
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
