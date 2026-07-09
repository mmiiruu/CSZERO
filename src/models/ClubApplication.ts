import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { APPLICANT_DEPARTMENTS } from "@/config/team";

const APPLICANT_DEPARTMENT_KEYS = APPLICANT_DEPARTMENTS.map((d) => d.key);

export interface IClubApplication extends Document {
  name: string;
  nickname: string;
  studentId: string;
  email: string;
  phone: string;
  contactChannel: string;
  photo: string;
  educationType: "regular" | "special";
  preferredDepartment1: string;
  preferredDepartment2: string;
  answers: Record<string, unknown>;
  interviewSlotId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClubApplicationSchema = new Schema<IClubApplication>(
  {
    name: { type: String, required: true },
    nickname: { type: String, required: true },
    studentId: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    contactChannel: { type: String, required: true },
    photo: { type: String, required: true },
    educationType: { type: String, required: true, enum: ["regular", "special"] },
    preferredDepartment1: { type: String, required: true, enum: APPLICANT_DEPARTMENT_KEYS },
    preferredDepartment2: { type: String, required: true, enum: APPLICANT_DEPARTMENT_KEYS },
    answers: { type: Schema.Types.Mixed, default: {} },
    interviewSlotId: { type: Schema.Types.ObjectId, ref: "InterviewSlot" },
  },
  { timestamps: true }
);

ClubApplicationSchema.index({ email: 1 }, { unique: true });
ClubApplicationSchema.index({ createdAt: -1 });

const ClubApplication: Model<IClubApplication> =
  mongoose.models.ClubApplication ||
  mongoose.model<IClubApplication>("ClubApplication", ClubApplicationSchema);

export default ClubApplication;
