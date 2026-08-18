import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyGoals extends Document {
  userId: mongoose.Types.ObjectId;
  goalHours: number;
  completedHours: number;
  targetLessons: number;
  completedLessonsCount: number;
  weekStartDate: Date;
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyGoalsSchema = new Schema<IWeeklyGoals>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalHours: { type: Number, required: true, default: 0 },
  completedHours: { type: Number, required: true, default: 0 },
  targetLessons: { type: Number, required: true, default: 0 },
  completedLessonsCount: { type: Number, required: true, default: 0 },
  weekStartDate: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' }
}, {
  timestamps: true
});

export const WeeklyGoals = mongoose.model<IWeeklyGoals>('WeeklyGoals', WeeklyGoalsSchema);
export default WeeklyGoals;
