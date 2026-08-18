import mongoose, { Schema, Document } from 'mongoose';

export interface IPlannerTask {
  title: string;
  category: 'Roadmap' | 'Practice' | 'General';
  duration: number; // minutes
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'completed' | 'missed';
  dueDate: Date;
  adaptiveRecoveryActive: boolean;
}

export interface IPlannerHabit {
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: Date[];
}

export interface IFocusConfig {
  pomodoroDuration: number; // standard 25 mins
  completedSessions: number;
  focusStudyMinutes: number;
}

export interface IStudyPlanner extends Document {
  userId: mongoose.Types.ObjectId;
  tasks: IPlannerTask[];
  habits: IPlannerHabit[];
  focusConfig: IFocusConfig;
  createdAt: Date;
  updatedAt: Date;
}

const PlannerTaskSchema = new Schema<IPlannerTask>({
  title: { type: String, required: true },
  category: { type: String, enum: ['Roadmap', 'Practice', 'General'], required: true },
  duration: { type: Number, required: true, default: 30 },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' },
  dueDate: { type: Date, required: true },
  adaptiveRecoveryActive: { type: Boolean, default: false }
});

const PlannerHabitSchema = new Schema<IPlannerHabit>({
  name: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  streak: { type: Number, default: 0 },
  completedDates: [{ type: Date }]
});

const FocusConfigSchema = new Schema<IFocusConfig>({
  pomodoroDuration: { type: Number, required: true, default: 25 },
  completedSessions: { type: Number, required: true, default: 0 },
  focusStudyMinutes: { type: Number, required: true, default: 0 }
});

const StudyPlannerSchema = new Schema<IStudyPlanner>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  tasks: [PlannerTaskSchema],
  habits: [PlannerHabitSchema],
  focusConfig: { 
    type: FocusConfigSchema, 
    default: () => ({ pomodoroDuration: 25, completedSessions: 0, focusStudyMinutes: 0 }) 
  }
}, {
  timestamps: true
});

export const StudyPlanner = mongoose.model<IStudyPlanner>('StudyPlanner', StudyPlannerSchema);
export default StudyPlanner;
