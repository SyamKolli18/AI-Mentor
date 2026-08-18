import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Full validation schema for final submit
const finalSubmitSchema = z.object({
  personal: z.object({
    phone: z.string().min(10, 'Valid phone number is required'),
    gender: z.string().min(1, 'Gender is required'),
    location: z.string().min(2, 'Location is required'),
  }),
  academic: z.object({
    degree: z.string().min(2, 'Degree is required'),
    branch: z.string().min(2, 'Branch/Stream is required'),
    graduationYear: z.number().int().min(2000).max(2035),
    cgpa: z.number().min(0).max(10),
    college: z.string().min(2, 'College name is required'),
  }),
  skills: z.object({
    languages: z.array(z.string()).min(1, 'Select at least one programming language'),
    subjects: z.array(z.string()).min(1, 'Select at least one core academic subject'),
    otherSkills: z.array(z.string()).default([]),
  }),
  careerGoals: z.object({
    preferredCareer: z.string().min(2, 'Preferred career path is required'),
    confidenceLevel: z.enum(['high', 'medium', 'low']),
    strengths: z.array(z.string()).min(1, 'Provide at least one strength'),
    weaknesses: z.array(z.string()).min(1, 'Provide at least one weakness'),
  }),
  preferences: z.object({
    learningStyle: z.enum(['visual', 'auditory', 'read-write', 'kinesthetic']),
    preferredLanguage: z.string().min(1, 'Preferred learning language is required'),
    dailyStudyTime: z.number().min(1).max(24),
    laptopSpecs: z.string().min(2, 'Laptop specs description is required'),
    communicationSkills: z.enum(['excellent', 'good', 'average', 'needs-improvement']),
  }),
  experience: z.object({
    projects: z.array(z.object({
      title: z.string().min(2),
      description: z.string().min(5),
      technologies: z.array(z.string()),
      link: z.string().optional(),
    })).default([]),
    certifications: z.array(z.object({
      name: z.string().min(2),
      issuingOrganization: z.string().min(2),
      issueDate: z.string().transform(val => new Date(val)).optional(),
      credentialUrl: z.string().optional(),
    })).default([]),
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    resumeUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const getOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Access denied. User session not found.', 401);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      onboarding: user.onboarding,
      isOnboarded: user.isOnboarded,
    });
  } catch (error) {
    next(error);
  }
};

export const saveProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Access denied. User session not found.', 401);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { personal, academic, skills, careerGoals, preferences, experience, currentStep } = req.body;

    // Merge incoming partial sections into user.onboarding
    if (personal) user.onboarding.personal = { ...user.onboarding.personal, ...personal };
    if (academic) user.onboarding.academic = { ...user.onboarding.academic, ...academic };
    if (skills) user.onboarding.skills = { ...user.onboarding.skills, ...skills };
    if (careerGoals) user.onboarding.careerGoals = { ...user.onboarding.careerGoals, ...careerGoals };
    if (preferences) user.onboarding.preferences = { ...user.onboarding.preferences, ...preferences };
    if (experience) user.onboarding.experience = { ...user.onboarding.experience, ...experience };
    if (typeof currentStep === 'number') {
      user.onboarding.currentStep = currentStep;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Onboarding progress saved successfully.',
      onboarding: user.onboarding,
    });
  } catch (error) {
    next(error);
  }
};

export const submitOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Access denied. User session not found.', 401);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Validate the incoming final data or the existing data on the user doc
    const dataToValidate = {
      personal: req.body.personal || user.onboarding.personal,
      academic: req.body.academic || user.onboarding.academic,
      skills: req.body.skills || user.onboarding.skills,
      careerGoals: req.body.careerGoals || user.onboarding.careerGoals,
      preferences: req.body.preferences || user.onboarding.preferences,
      experience: req.body.experience || user.onboarding.experience,
    };

    const validatedData = finalSubmitSchema.parse(dataToValidate);

    // Save final validated profile
    user.onboarding.personal = validatedData.personal;
    user.onboarding.academic = validatedData.academic;
    user.onboarding.skills = validatedData.skills;
    user.onboarding.careerGoals = validatedData.careerGoals;
    user.onboarding.preferences = validatedData.preferences;
    user.onboarding.experience = validatedData.experience;
    user.onboarding.completed = true;
    user.onboarding.currentStep = 5; // Final review completed step
    user.isOnboarded = true;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Onboarding completed successfully! Welcome to AI Mentor.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,
        onboarding: user.onboarding,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Onboarding validation failed. Please check all fields.', 400, error.errors));
    }
    next(error);
  }
};
