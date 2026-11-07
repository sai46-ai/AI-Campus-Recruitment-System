import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actor: mongoose.Types.ObjectId; actorEmail: string; action: string; targetResource: string; details?: Record<string, any>; ipAddress?: string; userAgent?: string; createdAt: Date;
}

const AuditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorEmail: { type: String, required: true },
    action: { type: String, required: true },
    targetResource: { type: String, required: true },
    details: Schema.Types.Mixed, ipAddress: String, userAgent: String
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
