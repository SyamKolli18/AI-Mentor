import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningResource extends Document {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number; // in minutes
  externalUrl: string;
  category: string; // Category name (e.g. "JavaScript", "React")
  resourceType: 'documentation' | 'playlist' | 'course' | 'practice' | 'project' | 'challenge' | 'quiz' | 'book' | 'cheat-sheet' | 'interview-notes';
  tags: string[];
  careerPaths: string[]; // e.g. ['frontend', 'backend']
  createdAt: Date;
  updatedAt: Date;
}

const LearningResourceSchema = new Schema<ILearningResource>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  estimatedTime: { type: Number, required: true },
  externalUrl: { type: String, required: true },
  category: { type: String, required: true, index: true },
  resourceType: { 
    type: String, 
    enum: ['documentation', 'playlist', 'course', 'practice', 'project', 'challenge', 'quiz', 'book', 'cheat-sheet', 'interview-notes'], 
    required: true 
  },
  tags: [{ type: String }],
  careerPaths: [{ type: String }]
}, {
  timestamps: true
});

export const LearningResource = mongoose.model<ILearningResource>('LearningResource', LearningResourceSchema);
export default LearningResource;
