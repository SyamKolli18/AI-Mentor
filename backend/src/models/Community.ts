import mongoose, { Schema, Document } from 'mongoose';

// Forums Model
export interface IForumComment {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface ICommunityForum extends Document {
  title: string;
  content: string;
  category: 'General' | 'Career' | 'Technical';
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  comments: IForumComment[];
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ForumCommentSchema = new Schema<IForumComment>({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CommunityForumSchema = new Schema<ICommunityForum>({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['General', 'Career', 'Technical'], default: 'General' },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  authorName: { type: String, required: true },
  comments: [ForumCommentSchema],
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

// Study Group Model
export interface IStudyGroup extends Document {
  name: string;
  description: string;
  members: mongoose.Types.ObjectId[];
  challengesCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudyGroupSchema = new Schema<IStudyGroup>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  challengesCompleted: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Projects Showcase Model
export interface IPeerReview {
  reviewerId: mongoose.Types.ObjectId;
  reviewerName: string;
  rating: number; // 1-5
  feedback: string;
  createdAt: Date;
}

export interface IProjectShowcase extends Document {
  title: string;
  description: string;
  repoUrl: string;
  liveUrl?: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  likes: mongoose.Types.ObjectId[]; // User IDs who liked
  peerReviews: IPeerReview[];
  createdAt: Date;
  updatedAt: Date;
}

const PeerReviewSchema = new Schema<IPeerReview>({
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProjectShowcaseSchema = new Schema<IProjectShowcase>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  repoUrl: { type: String, required: true },
  liveUrl: { type: String },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  authorName: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  peerReviews: [PeerReviewSchema]
}, {
  timestamps: true
});

// Achievement / Badges Model
export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  badgeType: 'Coding Guru' | 'Consistency Champion' | 'Interview Ace' | 'Helper Hand';
  points: number;
  achievedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  badgeType: { 
    type: String, 
    enum: ['Coding Guru', 'Consistency Champion', 'Interview Ace', 'Helper Hand'], 
    required: true 
  },
  points: { type: Number, required: true, default: 10 },
  achievedAt: { type: Date, default: Date.now }
});

export const CommunityForum = mongoose.model<ICommunityForum>('CommunityForum', CommunityForumSchema);
export const StudyGroup = mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema);
export const ProjectShowcase = mongoose.model<IProjectShowcase>('ProjectShowcase', ProjectShowcaseSchema);
export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
