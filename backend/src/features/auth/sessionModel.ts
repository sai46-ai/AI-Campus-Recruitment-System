import mongoose, { Schema, Document, Types } from 'mongoose';

export type SessionStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface ISession extends Document {
  sessionId: string;
  userId: Types.ObjectId;
  sessionFamilyId: string;
  currentTokenHash: string;
  consumedTokenHashes: string[];
  status: SessionStatus;
  revocationReason?: string;
  absoluteExpiresAt: Date;
  idleExpiresAt: Date;
  lastActivityAt: Date;
  lastRotatedAt: Date;
  rotationCount: number;
  authorizationVersionAtCreation: number;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionFamilyId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    currentTokenHash: {
      type: String,
      required: true,
      trim: true,
    },
    consumedTokenHashes: {
      type: [String],
      default: [],
      validate: {
        validator: (val: string[]) => Array.isArray(val) && val.length <= 1000,
        message: 'consumedTokenHashes cannot exceed 1000 entries (rotation ceiling)',
      },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    revocationReason: {
      type: String,
      trim: true,
    },
    absoluteExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    idleExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    lastRotatedAt: {
      type: Date,
      default: Date.now,
    },
    rotationCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000,
    },
    authorizationVersionAtCreation: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: '{VALUE} is not a safe integer',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SessionSchema.index({ userId: 1, status: 1 });
SessionSchema.index({ sessionFamilyId: 1, status: 1 });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

