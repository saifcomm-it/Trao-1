import mongoose, { Schema, Document } from 'mongoose';
import { InterviewPrepKit } from './types';

export interface IPrepKitDocument extends Document, InterviewPrepKit {
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  kind: { type: String, enum: ['technical', 'behavioural', 'domain'], required: true },
  priority: { type: String, enum: ['must', 'nice'], required: true }
}, { _id: false });

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  requirement_ids: [{ type: String, required: true }],
  category: { type: String, enum: ['technical', 'behavioural', 'system-design', 'company-fit'], required: true },
  prompt: { type: String, required: true },
  answer_outline: { type: String, required: true },
  difficulty: { type: Number, enum: [1, 2, 3], required: true },
  origin: { type: String, enum: ['generated', 'edited', 'manual'], default: 'generated' },
  isPinned: { type: Boolean, default: false }
}, { _id: false });

const FlashcardSchema = new Schema({
  id: { type: String, required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  requirement_ids: [{ type: String, required: true }],
  confidence: { type: String, enum: ['unreviewed', 'low', 'medium', 'high'], default: 'unreviewed' },
  origin: { type: String, enum: ['generated', 'edited', 'manual'], default: 'generated' },
  isPinned: { type: Boolean, default: false },
  userAnswer: { type: String, default: '' },
  lastPracticedAt: { type: String }
}, { _id: false });

const ScheduleDaySchema = new Schema({
  day: { type: Number, required: true },
  focus: { type: String, required: true },
  question_ids: [{ type: String, required: true }],
  minutes: { type: Number, required: true }
}, { _id: false });

const PrepKitSchema: Schema = new Schema({
  userId: { type: String, index: true },
  source: {
    company: { type: String, default: '' },
    company_url: { type: String, default: '' },
    role: { type: String, default: '' },
    location: { type: String, default: 'Not Specified' },
    jd_chars: { type: Number, default: 0 },
    researched_at: { type: String, default: () => new Date().toISOString() },
    pages_used: [{ type: String }]
  },
  company_brief: {
    summary: { type: String, default: '' },
    what_they_do: { type: String, default: '' },
    sources: [{ type: String }],
    isEdited: { type: Boolean, default: false }
  },
  role: {
    title: { type: String, default: '' },
    seniority: { type: String, default: 'Mid-Level (2-5 years)' },
    responsibilities: [{ type: String }],
    requirements: [RequirementSchema]
  },
  questions: [QuestionSchema],
  flashcards: [FlashcardSchema],
  schedule: {
    days_available: { type: Number, default: 5 },
    days: [ScheduleDaySchema]
  },
  coverage: {
    uncovered_requirement_ids: [{ type: String }],
    passes: { type: Number, default: 1 }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: (_, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret.__v;
      return ret;
    }
  }
});

export const PrepKit = mongoose.models.PrepKit || mongoose.model<IPrepKitDocument>('PrepKit', PrepKitSchema);
export const Kit = PrepKit;
export const kitModel = PrepKit;
export default PrepKit;
