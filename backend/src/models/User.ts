import mongoose, { Schema, Document } from 'mongoose';

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ICertification {
  name: string;
  issuingOrganization: string;
  issueDate?: Date;
  credentialUrl?: string;
}

export interface IOnboarding {
  personal?: {
    phone?: string;
    gender?: string;
    location?: string;
  };
  academic?: {
    degree?: string;
    branch?: string;
    graduationYear?: number;
    cgpa?: number;
    college?: string;
  };
  skills?: {
    languages: string[];
    subjects: string[];
    otherSkills: string[];
  };
  careerGoals?: {
    preferredCareer?: string;
    confidenceLevel?: 'high' | 'medium' | 'low';
    strengths: string[];
    weaknesses: string[];
  };
  preferences?: {
    learningStyle?: 'visual' | 'auditory' | 'read-write' | 'kinesthetic';
    preferredLanguage?: string;
    dailyStudyTime?: number; // hours
    laptopSpecs?: string;
    communicationSkills?: 'excellent' | 'good' | 'average' | 'needs-improvement';
  };
  experience?: {
    projects: IProject[];
    certifications: ICertification[];
    github?: string;
    linkedin?: string;
    resumeUrl?: string;
  };
  currentStep: number;
  completed: boolean;
}

export interface IAIProfile {
  scores: {
    programming: number;
    problemSolving: number;
    communication: number;
    mathematics: number;
    creativity: number;
    consistency: number;
    learningSpeed: number;
    confidence: number;
    
    // Part 1 Extensions:
    careerReadinessScore: number;
    technicalReadiness: number;
    programmingScore: number;
    problemSolvingScore: number;
    communicationScore: number;
    learningConsistency: number;
    mathematicsReadiness: number;
    csFundamentals: number;
    devReadiness: number;
    aiConfidenceScore: number;
  };
  insights: string[];
  observations: string[];
  timelineEstimate: {
    monthsRequired: number;
    weeklyEffortHours: number;
    dailyStudyHours: number;
    estimatedCompletionDate: Date;
  };
  studyRecommendations: string[];
  improvementSuggestions: string[];
  analyzedAt: Date;
}

export interface ICareerRecommendation {
  pathId: string;
  careerName: string;
  matchPercentage: number;
  whyMatches: string;
  requiredSkills: string[];
  currentSkillGap: string[];
  estimatedLearningTime: string;
  averageIndustryDemand: 'High' | 'Medium' | 'Low';
  suggestedStartingPoint: string;
  expectedSalaryRange: { min: number; max: number; currency: string };
  futureGrowth: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}


export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isOnboarded: boolean;
  onboarding: IOnboarding;
  aiProfile?: IAIProfile;
  careerRecommendations?: ICareerRecommendation[];
  role: 'student' | 'admin';
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  link: { type: String }
});

const CertificationSchema = new Schema<ICertification>({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: Date },
  credentialUrl: { type: String }
});

const OnboardingSchema = new Schema<IOnboarding>({
  personal: {
    phone: { type: String },
    gender: { type: String },
    location: { type: String }
  },
  academic: {
    degree: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    cgpa: { type: Number },
    college: { type: String }
  },
  skills: {
    languages: [{ type: String }],
    subjects: [{ type: String }],
    otherSkills: [{ type: String }]
  },
  careerGoals: {
    preferredCareer: { type: String },
    confidenceLevel: { type: String, enum: ['high', 'medium', 'low'] },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }]
  },
  preferences: {
    learningStyle: { type: String, enum: ['visual', 'auditory', 'read-write', 'kinesthetic'] },
    preferredLanguage: { type: String },
    dailyStudyTime: { type: Number },
    laptopSpecs: { type: String },
    communicationSkills: { type: String, enum: ['excellent', 'good', 'average', 'needs-improvement'] }
  },
  experience: {
    projects: [ProjectSchema],
    certifications: [CertificationSchema],
    github: { type: String },
    linkedin: { type: String },
    resumeUrl: { type: String }
  },
  currentStep: { type: Number, default: 1 },
  completed: { type: Boolean, default: false }
});

const AIProfileSchema = new Schema<IAIProfile>({
  scores: {
    programming: { type: Number, required: true },
    problemSolving: { type: Number, required: true },
    communication: { type: Number, required: true },
    mathematics: { type: Number, required: true },
    creativity: { type: Number, required: true },
    consistency: { type: Number, required: true },
    learningSpeed: { type: Number, required: true },
    confidence: { type: Number, required: true },
    
    careerReadinessScore: { type: Number, required: true, default: 0 },
    technicalReadiness: { type: Number, required: true, default: 0 },
    programmingScore: { type: Number, required: true, default: 0 },
    problemSolvingScore: { type: Number, required: true, default: 0 },
    communicationScore: { type: Number, required: true, default: 0 },
    learningConsistency: { type: Number, required: true, default: 0 },
    mathematicsReadiness: { type: Number, required: true, default: 0 },
    csFundamentals: { type: Number, required: true, default: 0 },
    devReadiness: { type: Number, required: true, default: 0 },
    aiConfidenceScore: { type: Number, required: true, default: 0 }
  },
  insights: [{ type: String }],
  observations: [{ type: String }],
  timelineEstimate: {
    monthsRequired: { type: Number, required: true, default: 0 },
    weeklyEffortHours: { type: Number, required: true, default: 0 },
    dailyStudyHours: { type: Number, required: true, default: 0 },
    estimatedCompletionDate: { type: Date, required: true, default: Date.now }
  },
  studyRecommendations: [{ type: String }],
  improvementSuggestions: [{ type: String }],
  analyzedAt: { type: Date, default: Date.now }
});

const CareerRecommendationSchema = new Schema<ICareerRecommendation>({
  pathId: { type: String, required: true },
  careerName: { type: String, required: true },
  matchPercentage: { type: Number, required: true },
  whyMatches: { type: String, required: true },
  requiredSkills: [{ type: String }],
  currentSkillGap: [{ type: String }],
  estimatedLearningTime: { type: String, required: true },
  averageIndustryDemand: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  suggestedStartingPoint: { type: String, required: true },
  expectedSalaryRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  futureGrowth: { type: String, required: true },
  difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true }
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isOnboarded: { type: Boolean, default: false },
  onboarding: {
    type: OnboardingSchema,
    default: () => ({
      currentStep: 1,
      completed: false,
      skills: { languages: [], subjects: [], otherSkills: [] },
      careerGoals: { strengths: [], weaknesses: [] },
      experience: { projects: [], certifications: [] }
    })
  },
  aiProfile: { type: AIProfileSchema },
  careerRecommendations: [CareerRecommendationSchema],
  role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
  refreshToken: { type: String }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
