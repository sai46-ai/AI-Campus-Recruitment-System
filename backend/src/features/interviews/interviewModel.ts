import mongoose, { Schema, Document } from 'mongoose';
import { InterviewStatus, InterviewType, InterviewMode } from '../../shared/constants/roles';

export interface IInterview extends Document {
  application: mongoose.Types.ObjectId; job: mongoose.Types.ObjectId; student: mongoose.Types.ObjectId; recruiter: mongoose.Types.ObjectId;
  scheduledDate: Date; scheduledTime: string; duration: number; type: InterviewType; mode: InterviewMode; location?: string; meetingLink?: string; status: InterviewStatus;
  participation: { studentJoined: boolean; recruiterJoined: boolean }; score?: number; feedback?: string; hiringDecision: 'Pending' | 'Recommended' | 'Not Recommended' | 'On Hold';
  createdAt: Date; updatedAt: Date;
}

const InterviewSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    duration: { type: Number, default: 60 },
    type: { type: String, enum: Object.values(InterviewType), default: InterviewType.TECHNICAL },
    mode: { type: String, enum: Object.values(InterviewMode), default: InterviewMode.VIDEO },
    location: String, meetingLink: String,
    status: { type: String, enum: Object.values(InterviewStatus), default: InterviewStatus.SCHEDULED },
    participation: { studentJoined: { type: Boolean, default: false }, recruiterJoined: { type: Boolean, default: false } },
    score: { type: Number, min: 0, max: 100 }, feedback: { type: String, maxlength: 2000 },
    hiringDecision: { type: String, enum: ['Pending', 'Recommended', 'Not Recommended', 'On Hold'], default: 'Pending' }
  },
  { timestamps: true }
);

InterviewSchema.index({ application: 1, scheduledDate: 1 });
InterviewSchema.index({ student: 1, scheduledDate: 1 });
InterviewSchema.index({ recruiter: 1, scheduledDate: 1 });

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
