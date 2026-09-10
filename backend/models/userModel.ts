import mongoose, { Schema, Document } from 'mongoose';

export interface IUserKit {
  id: string;
  company_name?: string;
  role_title?: string;
  source?: {
    company: string;
    company_url: string;
    role: string;
    location?: string;
    jd_chars?: number;
    researched_at?: string;
    pages_used?: string[];
  };
  company_brief?: {
    summary: string;
    what_they_do: string;
    sources?: string[];
    isEdited?: boolean;
  };
  role?: {
    title: string;
    seniority: string;
    responsibilities?: string[];
    requirements?: any[];
  };
  questions?: any[];
  flashcards?: any[];
  schedule?: {
    days_available: number;
    days: any[];
  };
  coverage?: {
    uncovered_requirement_ids?: string[];
    passes?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  targetRole?: string;
  seniority?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  kits: IUserKit[];
  createdAt: Date;
}

const UserKitSchema = new Schema({
  id: { type: String, required: true },
  company_name: { type: String, default: '' },
  role_title: { type: String, default: '' },
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
    requirements: [{
      id: { type: String },
      text: { type: String },
      kind: { type: String },
      priority: { type: String }
    }]
  },
  questions: [{
    id: { type: String },
    requirement_ids: [{ type: String }],
    category: { type: String },
    prompt: { type: String },
    answer_outline: { type: String },
    difficulty: { type: Schema.Types.Mixed },
    origin: { type: String, default: 'generated' },
    isPinned: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  flashcards: [{
    id: { type: String },
    front: { type: String },
    back: { type: String },
    requirement_ids: [{ type: String }],
    confidence: { type: String, default: 'unreviewed' },
    origin: { type: String, default: 'generated' },
    isPinned: { type: Boolean, default: false },
    userAnswer: { type: String, default: '' },
    lastPracticedAt: { type: String }
  }],
  schedule: {
    days_available: { type: Number, default: 5 },
    days: [{
      day: { type: Number },
      focus: { type: String },
      question_ids: [{ type: String }],
      minutes: { type: Number },
      tasks: [{ type: String }],
      isCompleted: { type: Boolean, default: false }
    }]
  },
  coverage: {
    uncovered_requirement_ids: [{ type: String }],
    passes: { type: Number, default: 1 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: false },
  targetRole: { type: String, required: false, default: '' },
  seniority: { type: String, required: false, default: '' },
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpires: { type: Date, required: false },
  kits: { type: [UserKitSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const userModel = User;
export default User;
