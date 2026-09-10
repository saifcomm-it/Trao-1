import mongoose, { Schema, Document } from 'mongoose';

export interface IRequirementItem {
  id: string;
  text: string;
  kind: 'technical' | 'behavioural' | 'domain';
  priority: 'must' | 'nice';
}

export interface IRoleDocument extends Document {
  kitId: string;
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: IRequirementItem[];
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  kind: { type: String, enum: ['technical', 'behavioural', 'domain'], required: true },
  priority: { type: String, enum: ['must', 'nice'], required: true }
}, { _id: false });

const RoleSchema: Schema = new Schema({
  kitId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  seniority: { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements: [RequirementSchema]
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

export const Role = mongoose.models.Role || mongoose.model<IRoleDocument>('Role', RoleSchema);
export const roleModel = Role;
export default Role;
