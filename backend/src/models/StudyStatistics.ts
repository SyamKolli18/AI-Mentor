import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyLog {
  date: Date;
  minutes: number;
}

export interface IStudyStatistics extends Document {
  userId: mongoose.Types.ObjectId;
  streakCount: number;
  lastActiveDate?: Date;
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  dailyLogs: IDailyLog[];
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>({
  date: { type: Date, required: true },
  minutes: { type: Number, required: true }
});

const StudyStatisticsSchema = new Schema<IStudyStatistics>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  streakCount: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  weeklyStudyMinutes: { type: Number, default: 0 },
  monthlyStudyMinutes: { type: Number, default: 0 },
  dailyLogs: [DailyLogSchema]
}, {
  timestamps: true
});

export const StudyStatistics = mongoose.model<IStudyStatistics>('StudyStatistics', StudyStatisticsSchema);
export default StudyStatistics;
