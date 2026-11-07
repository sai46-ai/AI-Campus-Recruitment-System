import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../shared/constants/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isVerified: boolean;
  isRecruiterVerified: boolean;
  googleId?: string;
  phone?: string;
  bio?: string;
  department?: string;
  graduationYear?: number;
  cgpa?: number;
  activeBacklogs?: number;
  skills: string[];
  avatar?: string;
  isActive: boolean;
  isDeleted: boolean;
  authorizationVersion: number;
  otpCode?: string;
  otpExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      select: false,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isRecruiterVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    department: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: Number,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    activeBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    authorizationVersion: {
      type: Number,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: '{VALUE} is not a safe integer',
      },
    },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ role: 1 });
UserSchema.index({ skills: 1 });
UserSchema.index({ department: 1, graduationYear: 1 });
UserSchema.index({ department: 1, cgpa: -1 });

UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) {
      this.authorizationVersion = (this.authorizationVersion || 1) + 1;
    }
  }
  if (!this.isNew && (this.isModified('role') || this.isModified('isActive') || this.isModified('isDeleted'))) {
    this.authorizationVersion = (this.authorizationVersion || 1) + 1;
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
