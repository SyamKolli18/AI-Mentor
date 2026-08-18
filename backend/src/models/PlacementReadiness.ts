import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyMatch {
  companyType: 'FAANG' | 'Tier-2 Product' | 'Startups' | 'Service-Based';
  matchPercentage: number;
}

export interface IPlacementScores {
  dsa: number;
  oop: number;
  dbms: number;
  os: number;
  networks: number;
  systemDesign: number;
  aptitude: number;
  communication: number;
  projects: number;
  githubActivity: number;
  mockInterviews: number;
}

export interface IProgressLog {
  label: string; // e.g. "Week 1", "June"
  score: number;
}

export interface IPlacementReadiness extends Document {
  userId: mongoose.Types.ObjectId;
  readinessScore: number;
  scores: IPlacementScores;
  companyReadiness: ICompanyMatch[];
  weakAreas: string[];
  strongAreas: string[];
  aiImprovementPlan: string[];
  weeklyProgress: IProgressLog[];
  monthlyProgress: IProgressLog[];
  createdAt: Date;
  updatedAt: Date;
}

const PlacementScoresSchema = new Schema<IPlacementScores>({
  dsa: { type: Number, required: true, default: 0 },
  oop: { type: Number, required: true, default: 0 },
  dbms: { type: Number, required: true, default: 0 },
  os: { type: Number, required: true, default: 0 },
  networks: { type: Number, required: true, default: 0 },
  systemDesign: { type: Number, required: true, default: 0 },
  aptitude: { type: Number, required: true, default: 0 },
  communication: { type: Number, required: true, default: 0 },
  projects: { type: Number, required: true, default: 0 },
  githubActivity: { type: Number, required: true, default: 0 },
  mockInterviews: { type: Number, required: true, default: 0 }
});

const CompanyMatchSchema = new Schema<ICompanyMatch>({
  companyType: { type: String, enum: ['FAANG', 'Tier-2 Product', 'Startups', 'Service-Based'], required: true },
  matchPercentage: { type: Number, required: true, default: 0 }
});

const ProgressLogSchema = new Schema<IProgressLog>({
  label: { type: String, required: true },
  score: { type: Number, required: true }
});

const PlacementReadinessSchema = new Schema<IPlacementReadiness>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  readinessScore: { type: Number, required: true, default: 0 },
  scores: { type: PlacementScoresSchema, required: true },
  companyReadiness: [CompanyMatchSchema],
  weakAreas: [{ type: String }],
  strongAreas: [{ type: String }],
  aiImprovementPlan: [{ type: String }],
  weeklyProgress: [ProgressLogSchema],
  monthlyProgress: [ProgressLogSchema]
}, {
  timestamps: true
});

export const PlacementReadiness = mongoose.model<IPlacementReadiness>('PlacementReadiness', PlacementReadinessSchema);
export default PlacementReadiness;
