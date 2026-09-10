import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduleDayItem {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
  isCompleted?: boolean;
}

export interface IScheduleDocument extends Document {
  kitId: string;
  days_available: number;
  days: IScheduleDayItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleDaySchema = new Schema({
  day: { type: Number, required: true },
  focus: { type: String, required: true },
  question_ids: [{ type: String, required: true }],
  minutes: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false }
}, { _id: false });

const ScheduleSchema: Schema = new Schema({
  kitId: { type: String, required: true, index: true, unique: true },
  days_available: { type: Number, required: true },
  days: [ScheduleDaySchema]
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

export const Schedule = mongoose.models.Schedule || mongoose.model<IScheduleDocument>('Schedule', ScheduleSchema);
export const scheduleModel = Schedule;
export default Schedule;
