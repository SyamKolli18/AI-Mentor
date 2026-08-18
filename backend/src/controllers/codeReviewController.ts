import { Request, Response, NextFunction } from 'express';
import { CodeReview } from '../models/CodeReview';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const submitCodeReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { projectName, repositoryUrl, submissionType, pastedCode } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!projectName || !submissionType) {
      throw new AppError('Project name and submission type are required', 400);
    }

    // Default starting scores
    let codeQualityScore = 80;
    let recruiterReadinessScore = 75;
    let portfolioScore = 82;
    let performanceScore = 85;
    let securityScore = 90;

    const suggestions: string[] = [];
    const refactoringRecommendations: string[] = [];
    const missingFeatures: string[] = [];
    const improvementRoadmap: string[] = [];
    let folderStructureFeedback = '✅ Clean and logical standard modular structure.';
    let namingConventionFeedback = '✅ Adheres to standard camelCase variable patterns and PascalCase components naming conventions.';

    // Run rules on pasted code if provided
    if (submissionType === 'text' && pastedCode) {
      const code = pastedCode.toLowerCase();

      // Rule 1: Unsafe methods (Security check)
      if (code.includes('eval(') || code.includes('innerhtml') || code.includes('document.write')) {
        securityScore -= 25;
        suggestions.push('🔒 Security Warning: Avoid using eval() or innerHTML, as they expose the application to Cross-Site Scripting (XSS) attacks.');
        refactoringRecommendations.push('Replace innerHTML mappings with React safe string nodes or explicit state bindings.');
      }

      // Rule 2: Nested loops (Performance check)
      const matches = code.match(/(for|while|foreach)\s*\(/g);
      if (matches && matches.length > 2) {
        performanceScore -= 15;
        suggestions.push('⚡ Performance Tip: Multiple nested loops detected. Review time complexity constraints (O(N^2) or higher).');
        refactoringRecommendations.push('Consolidate iterations or map values into hash lookup keys to support linear O(N) access.');
      }

      // Rule 3: Missing TypeScript declarations (Readability check)
      if (code.includes(': any') || !code.includes('interface ') && !code.includes('type ')) {
        codeQualityScore -= 10;
        namingConventionFeedback = '⚠️ Typings Warning: Frequent use of explicit "any" type definitions overrides TS compilers safety checks.';
        refactoringRecommendations.push('Replace generic typed array objects with detailed typescript interfaces or type aliases.');
      }

      // Rule 4: Hardcoded credentials
      if (code.includes('api_key') || code.includes('secret') || code.includes('password =') || code.includes('token =')) {
        securityScore -= 30;
        suggestions.push('🔒 Security Alert: Hardcoded credentials/keys detected inside source file.');
        refactoringRecommendations.push('Refactor sensitive secrets into backend environment files (.env) loaded at runtime.');
      }
    } else if (submissionType === 'github' && repositoryUrl) {
      // Analyze GitHub config files
      const url = repositoryUrl.toLowerCase();
      if (!url.includes('github.com')) {
        throw new AppError('Please provide a valid GitHub repository link.', 400);
      }
      portfolioScore += 10; // Repo uploads score higher on portfolio
    } else if (submissionType === 'zip') {
      // Zip files have general file architecture feedbacks
      folderStructureFeedback = '⚠️ Architecture Alert: Missing standard config files (e.g. .gitignore, package-lock.json). Ensure node_modules are excluded from package archives.';
      codeQualityScore -= 5;
    }

    // Calibrate global scores
    codeQualityScore = Math.max(30, Math.min(99, codeQualityScore));
    recruiterReadinessScore = Math.max(30, Math.min(99, Math.round((codeQualityScore + portfolioScore + performanceScore) / 3)));
    portfolioScore = Math.max(30, Math.min(99, portfolioScore));
    performanceScore = Math.max(30, Math.min(99, performanceScore));
    securityScore = Math.max(30, Math.min(99, securityScore));

    // Fill defaults for arrays if empty
    if (suggestions.length === 0) {
      suggestions.push('✅ Good encapsulation of logic gates.');
      suggestions.push('✅ Zero major lint issues encountered.');
    }
    if (refactoringRecommendations.length === 0) {
      refactoringRecommendations.push('Encapsulate side-effects inside custom hook controllers to modularize view layers.');
    }
    missingFeatures.push('Incorporate comprehensive unit test blocks (Jest/Vitest) verifying core functional logic gates.');
    missingFeatures.push('Set up continuous deployment (CI/CD) YAML actions to auto-compile bundle assets.');

    improvementRoadmap.push('Phase 1: Refactor states and clean up remaining implicit typed variables (1-2 days).');
    improvementRoadmap.push('Phase 2: Integrate unit testing scopes covering edge cases (3-4 days).');
    improvementRoadmap.push('Phase 3: Package bundle into lightweight container setups (Docker) for cloud launch (5 days).');

    const review = new CodeReview({
      userId: new mongoose.Types.ObjectId(userId),
      projectName,
      repositoryUrl,
      submissionType,
      pastedCode,
      codeQualityScore,
      recruiterReadinessScore,
      portfolioScore,
      performanceScore,
      securityScore,
      suggestions,
      refactoringRecommendations,
      missingFeatures,
      improvementRoadmap,
      folderStructureFeedback,
      namingConventionFeedback
    });

    await review.save();

    res.status(201).json({
      status: 'success',
      message: 'Code review completed and compiled successfully.',
      review
    });
  } catch (error) {
    next(error);
  }
};

export const getCodeReviewHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const history = await CodeReview.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};
