import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewQuestion {
  question: string;
  sampleAnswer: string;
  userResponse?: string;
  score?: number;
  feedback?: string;
}

export interface IInterviewFeedback {
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  problemSolving: number;
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  topicsToRevise: string[];
  recommendedResources: string[];
  improvementRoadmap: string[];
}

export interface IMockInterview extends Document {
  userId: mongoose.Types.ObjectId;
  interviewType: 'Technical' | 'HR' | 'Behavioral' | 'Coding' | 'System Design';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'active' | 'completed';
  currentQuestionIndex: number;
  questions: IInterviewQuestion[];
  feedback?: IInterviewFeedback;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>({
  question: { type: String, required: true },
  sampleAnswer: { type: String, required: true },
  userResponse: { type: String },
  score: { type: Number },
  feedback: { type: String }
});

const InterviewFeedbackSchema = new Schema<IInterviewFeedback>({
  communicationScore: { type: Number, required: true },
  technicalScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  problemSolving: { type: Number, required: true },
  overallRating: { type: Number, required: true },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  topicsToRevise: [{ type: String }],
  recommendedResources: [{ type: String }],
  improvementRoadmap: [{ type: String }]
});

const MockInterviewSchema = new Schema<IMockInterview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  interviewType: { 
    type: String, 
    enum: ['Technical', 'HR', 'Behavioral', 'Coding', 'System Design'], 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    default: 'Intermediate' 
  },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  currentQuestionIndex: { type: Number, default: 0 },
  questions: [InterviewQuestionSchema],
  feedback: { type: InterviewFeedbackSchema }
}, {
  timestamps: true
});

export const MockInterview = mongoose.model<IMockInterview>('MockInterview', MockInterviewSchema);
export default MockInterview;
