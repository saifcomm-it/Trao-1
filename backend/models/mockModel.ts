import mongoose, { Schema, Document } from 'mongoose';

export interface IMockSession extends Document {
  userId?: string;
  kitId?: string;
  questionId?: string;
  questionPrompt: string;
  answerOutline?: string;
  userAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  improvements?: string[];
  createdAt: Date;
}

const MockSessionSchema: Schema = new Schema({
  userId: { type: String, required: false, index: true },
  kitId: { type: String, required: false, index: true },
  questionId: { type: String, required: false, index: true },
  questionPrompt: { type: String, required: true },
  answerOutline: { type: String, required: false },
  userAnswer: { type: String, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  strengths: [{ type: String }],
  gaps: [{ type: String }],
  improvements: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const MockSession = mongoose.models.MockSession || mongoose.model<IMockSession>('MockSession', MockSessionSchema);
export const mockModel = MockSession;
export default MockSession;
