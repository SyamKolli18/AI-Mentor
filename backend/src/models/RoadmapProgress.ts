import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizScore {
  moduleId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface IRoadmapProgress extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  completedLessons: string[]; // references of lesson keys, e.g., "mod-1_topic-0_lesson-1"
  completedProjects: string[]; // references of module ids that completed their projects, e.g., "mod-1"
  quizScores: IQuizScore[];
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizScoreSchema = new Schema<IQuizScore>({
  moduleId: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

const RoadmapProgressSchema = new Schema<IRoadmapProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true, index: true },
  completedLessons: [{ type: String }],
  completedProjects: [{ type: String }],
  quizScores: [QuizScoreSchema],
  completionPercentage: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const RoadmapProgress = mongoose.model<IRoadmapProgress>('RoadmapProgress', RoadmapProgressSchema);
export default RoadmapProgress;
