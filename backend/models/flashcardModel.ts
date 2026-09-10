import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcardDocument extends Document {
  kitId: string;
  userId?: string;
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
  confidence: 'unreviewed' | 'low' | 'medium' | 'high';
  userAnswer?: string;
  lastPracticedAt?: string;
  origin: 'generated' | 'edited' | 'manual';
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema: Schema = new Schema({
  kitId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  id: { type: String, required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  requirement_ids: [{ type: String, required: true }],
  confidence: {
    type: String,
    enum: ['unreviewed', 'low', 'medium', 'high'],
    default: 'unreviewed',
    index: true
  },
  userAnswer: { type: String, default: '' },
  lastPracticedAt: { type: String },
  origin: { type: String, enum: ['generated', 'edited', 'manual'], default: 'generated' },
  isPinned: { type: Boolean, default: false }
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

FlashcardSchema.index({ kitId: 1, confidence: 1 });

export const Flashcard = mongoose.models.Flashcard || mongoose.model<IFlashcardDocument>('Flashcard', FlashcardSchema);
export const flashcardModel = Flashcard;
export default Flashcard;
