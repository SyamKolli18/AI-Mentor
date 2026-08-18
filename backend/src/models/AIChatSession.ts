import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IFavoriteResponse {
  messageId: string;
  content: string;
}

export interface IAIChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  isSaved: boolean;
  favorites: IFavoriteResponse[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const FavoriteResponseSchema = new Schema<IFavoriteResponse>({
  messageId: { type: String, required: true },
  content: { type: String, required: true }
});

const AIChatSessionSchema = new Schema<IAIChatSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, default: 'New Conversation' },
  messages: [MessageSchema],
  isSaved: { type: Boolean, default: false },
  favorites: [FavoriteResponseSchema]
}, {
  timestamps: true
});

export const AIChatSession = mongoose.model<IAIChatSession>('AIChatSession', AIChatSessionSchema);
export default AIChatSession;
