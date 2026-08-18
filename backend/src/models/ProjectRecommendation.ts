import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  projectName: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedDuration: string;
  requiredTechnologies: string[];
  learningOutcomes: string[];
  portfolioValue: string;
  recruiterValue: string;
  resumeValue: string;
  githubBestPractices: string[];
  folderStructure: string;
  databaseDesign: string;
  apiSuggestions: string[];
  stretchGoals: string[];
  deploymentGuide: string;
  status: 'recommended' | 'saved' | 'completed';
  repoUrl?: string;
  screenshots: string[];
  reflections?: string;
  completionPercentage: number;
  bookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectRecommendationSchema = new Schema<IProjectRecommendation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  estimatedDuration: { type: String, required: true },
  requiredTechnologies: [{ type: String }],
  learningOutcomes: [{ type: String }],
  portfolioValue: { type: String, required: true },
  recruiterValue: { type: String, required: true },
  resumeValue: { type: String, required: true },
  githubBestPractices: [{ type: String }],
  folderStructure: { type: String, required: true },
  databaseDesign: { type: String, required: true },
  apiSuggestions: [{ type: String }],
  stretchGoals: [{ type: String }],
  deploymentGuide: { type: String, required: true },
  status: { type: String, enum: ['recommended', 'saved', 'completed'], default: 'recommended' },
  repoUrl: { type: String },
  screenshots: [{ type: String }],
  reflections: { type: String },
  completionPercentage: { type: Number, default: 0 },
  bookmarked: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const ProjectRecommendation = mongoose.model<IProjectRecommendation>('ProjectRecommendation', ProjectRecommendationSchema);
export default ProjectRecommendation;
