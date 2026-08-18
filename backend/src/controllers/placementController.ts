import { Response, NextFunction } from 'express';
import { PlacementReadiness } from '../models/PlacementReadiness';
import { User } from '../models/User';
import { MockInterview } from '../models/MockInterview';
import { RoadmapProgress } from '../models/RoadmapProgress';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getPlacementReadiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if placement report exists
    let readiness = await PlacementReadiness.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!readiness) {
      readiness = await calculateReadinessMetrics(userId, user);
    }

    res.status(200).json({
      status: 'success',
      readiness
    });
  } catch (error) {
    next(error);
  }
};

export const forceRecalculateReadiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const readiness = await calculateReadinessMetrics(userId, user);

    res.status(200).json({
      status: 'success',
      message: 'Placement readiness profile successfully updated.',
      readiness
    });
  } catch (error) {
    next(error);
  }
};

// Internal metric aggregation logic
const calculateReadinessMetrics = async (userId: string, user: any): Promise<any> => {
  // Query dependencies
  const [interviews, progress] = await Promise.all([
    MockInterview.find({ userId: new mongoose.Types.ObjectId(userId), status: 'completed' }),
    RoadmapProgress.findOne({ userId: new mongoose.Types.ObjectId(userId) })
  ]);

  // Baseline values from user's onboarding & AI profile
  const profileScores = user.aiProfile?.scores || {
    programming: 60,
    problemSolving: 55,
    communication: 70,
    mathematics: 60,
    csFundamentals: 50,
    devReadiness: 40
  };

  // Compile Mock Interview rating
  let mockInterviewsScore = 50; // baseline
  if (interviews.length > 0) {
    const total = interviews.reduce((sum, int) => sum + (int.feedback?.overallRating || 0), 0);
    mockInterviewsScore = Math.round(total / interviews.length);
  }

  // Compile roadmap completion percent
  const roadmapPercent = progress ? progress.completionPercentage : 0;

  // Grade sub-topics (DSA, OOP, DBMS, OS, Networks, System Design, Aptitude, Comm, Projects, GitHub)
  const onboardingSubjects = user.onboarding?.skills?.subjects || [];
  const knowsSubject = (sub: string) => onboardingSubjects.some((s: string) => s.toLowerCase().includes(sub.toLowerCase()));

  // Topics scoring formulas
  const dsa = Math.min(99, (knowsSubject('structure') || knowsSubject('algorithm') ? 70 : 45) + Math.round(roadmapPercent * 0.25));
  const oop = knowsSubject('oop') || knowsSubject('programming') ? 78 : 55;
  const dbms = knowsSubject('dbms') || knowsSubject('database') ? 80 : 50;
  const os = knowsSubject('operating') || knowsSubject('kernel') ? 75 : 45;
  const networks = knowsSubject('network') ? 72 : 48;
  
  // System Design correlates with project size
  const projectsCount = user.onboarding?.experience?.projects?.length || 0;
  const systemDesign = Math.min(95, 45 + projectsCount * 15 + Math.round(roadmapPercent * 0.2));
  
  // Aptitude correlates with mathematics score
  const aptitude = Math.min(98, profileScores.mathematics || 60);
  
  // Communication correlates with onboarding evaluation
  const comm = profileScores.communication || 70;
  
  // Projects score correlates with projects count and completion
  const projects = Math.min(99, 40 + projectsCount * 20 + Math.round(roadmapPercent * 0.15));
  
  // Github activity checks socials and completions
  const hasGithub = user.onboarding?.experience?.github ? 85 : 45;
  const githubActivity = Math.min(99, hasGithub + Math.round(roadmapPercent * 0.15));

  // Compute Overall Placement Readiness score
  const readinessScore = Math.round(
    (dsa * 0.2) + 
    (systemDesign * 0.15) + 
    (projects * 0.15) + 
    (mockInterviewsScore * 0.15) + 
    (comm * 0.1) + 
    (aptitude * 0.1) + 
    ((oop + dbms + os + networks) / 4 * 0.15)
  );

  // Target Company Matches
  const companyReadiness = [
    { companyType: 'FAANG', matchPercentage: Math.round(readinessScore * 0.85) },
    { companyType: 'Tier-2 Product', matchPercentage: Math.round(readinessScore * 0.95) },
    { companyType: 'Startups', matchPercentage: Math.min(99, Math.round(readinessScore * 1.05)) },
    { companyType: 'Service-Based', matchPercentage: Math.min(99, Math.round(readinessScore * 1.2)) }
  ];

  // Compile strengths & weaknesses lists
  const weakAreas: string[] = [];
  const strongAreas: string[] = [];
  const aiImprovementPlan: string[] = [];

  if (dsa >= 75) strongAreas.push('Algorithms & Data Structures reasoning');
  else {
    weakAreas.push('Data Structures & Algorithms (e.g. tree traversals, dynamic programming)');
    aiImprovementPlan.push('Task 1: Solve 2-3 intermediate DSA challenges daily on practice portals.');
  }

  if (systemDesign >= 70) strongAreas.push('High-level System Architecture & Cache proxy routing');
  else {
    weakAreas.push('Distributed System Design (e.g. load balancing, sharding layouts)');
    aiImprovementPlan.push('Task 2: Study sliding window rate limiting and message queues protocols.');
  }

  if (mockInterviewsScore >= 75) strongAreas.push('Oral Interview articulation and confidence');
  else {
    weakAreas.push('Technical Mock Interview feedback scores');
    aiImprovementPlan.push('Task 3: Conduct weekly Mock Interview arenas to practice keyword coverage.');
  }

  if (projectsCount >= 2) strongAreas.push('Hands-on Development projects portfolio');
  else {
    weakAreas.push('Lack of portfolio-quality projects');
    aiImprovementPlan.push('Task 4: Save and implement at least one premium dashboard blueprint.');
  }

  if (weakAreas.length === 0) {
    strongAreas.push('Excellent core engineering fundamentals');
    aiImprovementPlan.push('Task: Prepare for competitive coding contests and peer mentoring sessions.');
  }

  // Monthly and weekly logs mock points to show progress charts
  const weeklyProgress = [
    { label: 'Week 1', score: Math.max(30, readinessScore - 15) },
    { label: 'Week 2', score: Math.max(30, readinessScore - 8) },
    { label: 'Week 3', score: Math.max(30, readinessScore - 3) },
    { label: 'Week 4', score: readinessScore }
  ];

  const monthlyProgress = [
    { label: 'April', score: Math.max(30, readinessScore - 20) },
    { label: 'May', score: Math.max(30, readinessScore - 10) },
    { label: 'June', score: readinessScore }
  ];

  // Save to database
  let readiness = await PlacementReadiness.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (readiness) {
    readiness.readinessScore = readinessScore;
    readiness.scores = { dsa, oop, dbms, os, networks, systemDesign, aptitude, communication: comm, projects, githubActivity, mockInterviews: mockInterviewsScore };
    readiness.companyReadiness = companyReadiness as any;
    readiness.weakAreas = weakAreas;
    readiness.strongAreas = strongAreas;
    readiness.aiImprovementPlan = aiImprovementPlan;
    await readiness.save();
  } else {
    readiness = new PlacementReadiness({
      userId: new mongoose.Types.ObjectId(userId),
      readinessScore,
      scores: { dsa, oop, dbms, os, networks, systemDesign, aptitude, communication: comm, projects, githubActivity, mockInterviews: mockInterviewsScore },
      companyReadiness,
      weakAreas,
      strongAreas,
      aiImprovementPlan,
      weeklyProgress,
      monthlyProgress
    });
    await readiness.save();
  }

  return readiness;
};
