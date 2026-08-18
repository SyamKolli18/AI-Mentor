import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  title: string;
  duration?: string;
  isCompleted: boolean;
}

export interface ITopic {
  title: string;
  lessons: ILesson[];
  resources: string[];
  miniProject?: {
    title: string;
    description: string;
  };
}

export interface IProjectDetail {
  title: string;
  description: string;
}

export interface IQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface IRoadmapModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: 'locked' | 'unlocked' | 'in-progress' | 'completed';
  topics: ITopic[];
  estimatedCompletionTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  
  // Part 2 Extensions:
  learningOutcome: string;
  completionPercentage: number;
  miniProjects: IProjectDetail[];
  majorProject?: IProjectDetail;
  checkpointQuiz?: {
    questions: IQuizQuestion[];
  };
  notes?: string;
  aiTips?: string;
  unlockCondition?: string;
}

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  targetCareer: string;
  version: number;
  modules: IRoadmapModule[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  duration: { type: String },
  isCompleted: { type: Boolean, default: false }
});

const TopicSchema = new Schema<ITopic>({
  title: { type: String, required: true },
  lessons: [LessonSchema],
  resources: [{ type: String }],
  miniProject: {
    title: { type: String },
    description: { type: String }
  }
});

const ProjectDetailSchema = new Schema<IProjectDetail>({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: { type: Number, required: true }
});

const RoadmapModuleSchema = new Schema<IRoadmapModule>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  status: { type: String, enum: ['locked', 'unlocked', 'in-progress', 'completed'], default: 'locked' },
  topics: [TopicSchema],
  estimatedCompletionTime: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  prerequisites: [{ type: String }],
  
  learningOutcome: { type: String, required: true, default: '' },
  completionPercentage: { type: Number, default: 0 },
  miniProjects: [ProjectDetailSchema],
  majorProject: ProjectDetailSchema,
  checkpointQuiz: {
    questions: [QuizQuestionSchema]
  },
  notes: { type: String },
  aiTips: { type: String },
  unlockCondition: { type: String }
});

const RoadmapSchema = new Schema<IRoadmap>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetCareer: { type: String, required: true },
  version: { type: Number, default: 1 },
  modules: [RoadmapModuleSchema],
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
export default Roadmap;
