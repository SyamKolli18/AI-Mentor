import mongoose, { Schema, Document } from 'mongoose';

export interface IResourceCategory extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceCategorySchema = new Schema<IResourceCategory>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String }
}, {
  timestamps: true
});

export const ResourceCategory = mongoose.model<IResourceCategory>('ResourceCategory', ResourceCategorySchema);
export default ResourceCategory;
