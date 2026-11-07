import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacementStats extends Document {
  academicYear: string; totalStudents: number; placedStudents: number; placementPercentage: number; averagePackageLpa: number; highestPackageLpa: number;
  topRecruiters: { companyName: string; offersCount: number; packageLpa: number }[];
  departmentStats: { departmentName: string; totalEligible: number; placedCount: number; avgPackage: number }[];
  createdAt: Date; updatedAt: Date;
}

const PlacementStatsSchema = new Schema(
  {
    academicYear: { type: String, required: true, unique: true },
    totalStudents: { type: Number, default: 0 },
    placedStudents: { type: Number, default: 0 },
    placementPercentage: { type: Number, default: 0 },
    averagePackageLpa: { type: Number, default: 0 },
    highestPackageLpa: { type: Number, default: 0 },
    topRecruiters: [{ companyName: String, offersCount: Number, packageLpa: Number }],
    departmentStats: [{ departmentName: String, totalEligible: Number, placedCount: Number, avgPackage: Number }]
  },
  { timestamps: true }
);

export default mongoose.models.PlacementStats || mongoose.model<IPlacementStats>('PlacementStats', PlacementStatsSchema);
