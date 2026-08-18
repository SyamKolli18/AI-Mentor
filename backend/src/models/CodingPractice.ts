import mongoose, { Schema, Document } from 'mongoose';

export interface IContestRecord {
  contestName: string;
  rank: number;
  rating: number;
}

export interface ITopicMastery {
  topicName: string;
  questionsCount: number;
  strengthIndex: number; // 0 - 100
}

export interface IHeatmapPoint {
  date: Date;
  count: number;
}

export interface IRevisionRecord {
  topicName: string;
  revisedAt: Date;
}

export interface ICodingPractice extends Document {
  userId: mongoose.Types.ObjectId;
  streakCount: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  contestRating: number;
  contestHistory: IContestRecord[];
  topicMastery: ITopicMastery[];
  activityHeatmap: IHeatmapPoint[];
  revisionHistory: IRevisionRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const ContestRecordSchema = new Schema<IContestRecord>({
  contestName: { type: String, required: true },
  rank: { type: Number, required: true },
  rating: { type: Number, required: true }
});

const TopicMasterySchema = new Schema<ITopicMastery>({
  topicName: { type: String, required: true },
  questionsCount: { type: Number, required: true, default: 0 },
  strengthIndex: { type: Number, required: true, default: 50 }
});

const HeatmapPointSchema = new Schema<IHeatmapPoint>({
  date: { type: Date, required: true },
  count: { type: Number, required: true, default: 0 }
});

const RevisionRecordSchema = new Schema<IRevisionRecord>({
  topicName: { type: String, required: true },
  revisedAt: { type: Date, default: Date.now }
});

const CodingPracticeSchema = new Schema<ICodingPractice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  streakCount: { type: Number, default: 0 },
  solvedEasy: { type: Number, default: 0 },
  solvedMedium: { type: Number, default: 0 },
  solvedHard: { type: Number, default: 0 },
  contestRating: { type: Number, default: 1500 },
  contestHistory: [ContestRecordSchema],
  topicMastery: [TopicMasterySchema],
  activityHeatmap: [HeatmapPointSchema],
  revisionHistory: [RevisionRecordSchema]
}, {
  timestamps: true
});

export const CodingPractice = mongoose.model<ICodingPractice>('CodingPractice', CodingPracticeSchema);
export default CodingPractice;
