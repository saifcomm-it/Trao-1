import mongoose, { Schema, Document } from 'mongoose';
import { QuestionCategory } from './types';

export interface IQuestionDocument extends Document {
  kitId: string;
  id: string;
  requirement_ids: string[];
  category: QuestionCategory;
  prompt: string;
  answer_outline: string;
  difficulty: 1 | 2 | 3;
  origin: 'generated' | 'edited' | 'manual';
  isPinned: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  kitId: { type: String, required: true, index: true },
  id: { type: String, required: true },
  requirement_ids: [{ type: String, required: true }],
  category: {
    type: String,
    enum: ['technical', 'behavioural', 'system-design', 'company-fit'],
    required: true,
    index: true
  },
  prompt: { type: String, required: true },
  answer_outline: { type: String, required: true },
  difficulty: { type: Number, enum: [1, 2, 3], required: true },
  origin: { type: String, enum: ['generated', 'edited', 'manual'], default: 'generated' },
  isPinned: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret.id || ret._id?.toString();
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: (_, ret: any) => {
      ret.id = ret.id || ret._id?.toString();
      delete ret.__v;
      return ret;
    }
  }
});


QuestionSchema.index({ kitId: 1, category: 1, order: 1 });

export const Question = mongoose.models.Question || mongoose.model<IQuestionDocument>('Question', QuestionSchema);
export const questionModel = Question;
export default Question;
