import mongoose, { Schema, Document } from 'mongoose';

export interface ICodeReview extends Document {
  userId: mongoose.Types.ObjectId;
  projectName: string;
  repositoryUrl?: string;
  submissionType: 'zip' | 'github' | 'text';
  pastedCode?: string;
  codeQualityScore: number;
  recruiterReadinessScore: number;
  portfolioScore: number;
  performanceScore: number;
  securityScore: number;
  suggestions: string[];
  refactoringRecommendations: string[];
  missingFeatures: string[];
  improvementRoadmap: string[];
  folderStructureFeedback?: string;
  namingConventionFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CodeReviewSchema = new Schema<ICodeReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectName: { type: String, required: true },
  repositoryUrl: { type: String },
  submissionType: { type: String, enum: ['zip', 'github', 'text'], required: true },
  pastedCode: { type: String },
  codeQualityScore: { type: Number, required: true },
  recruiterReadinessScore: { type: Number, required: true },
  portfolioScore: { type: Number, required: true },
  performanceScore: { type: Number, required: true },
  securityScore: { type: Number, required: true },
  suggestions: [{ type: String }],
  refactoringRecommendations: [{ type: String }],
  missingFeatures: [{ type: String }],
  improvementRoadmap: [{ type: String }],
  folderStructureFeedback: { type: String },
  namingConventionFeedback: { type: String }
}, {
  timestamps: true
});

export const CodeReview = mongoose.model<ICodeReview>('CodeReview', CodeReviewSchema);
export default CodeReview;
