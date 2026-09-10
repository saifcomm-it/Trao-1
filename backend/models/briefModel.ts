import mongoose, { Schema, Document } from 'mongoose';

export interface IBriefDocument extends Document {
  kitId: string;
  company: string;
  company_url: string;
  location?: string;
  summary: string;
  what_they_do: string;
  sources: string[];
  isEdited: boolean;
  researched_at?: string;
  pages_used?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BriefSchema: Schema = new Schema({
  kitId: { type: String, required: true, index: true },
  company: { type: String, required: true },
  company_url: { type: String, required: true },
  location: { type: String, default: 'Not Specified' },
  summary: { type: String, required: true },
  what_they_do: { type: String, required: true },
  sources: [{ type: String }],
  isEdited: { type: Boolean, default: false },
  researched_at: { type: String },
  pages_used: [{ type: String }]
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

export const Brief = mongoose.models.Brief || mongoose.model<IBriefDocument>('Brief', BriefSchema);
export const briefModel = Brief;
export default Brief;
