import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICandidateApplication extends Document {
  title?: string;
  name: string;
  email: string;
  nickname?: string;
  section?: string;
  image?: string;
  motto?: string;
  videoUrl?: string;
  dutyAnswer?: string;
  visionAnswer?: string;
  strengthWeaknessAnswer?: string;
  conflictAnswer?: string;
  // Legacy fields (pre-redesign)
  studentId?: string;
  year?: string;
  role?: string;
  bio?: string;
  motivation?: string;
  voteCount: number;
  promoted: boolean;
  promotedCandidateId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateApplicationSchema = new Schema<ICandidateApplication>(
  {
    title: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    nickname: { type: String },
    section: { type: String },
    image: { type: String },
    motto: { type: String },
    videoUrl: { type: String },
    dutyAnswer: { type: String },
    visionAnswer: { type: String },
    strengthWeaknessAnswer: { type: String },
    conflictAnswer: { type: String },
    // Legacy
    studentId: { type: String },
    year: { type: String },
    role: { type: String },
    bio: { type: String },
    motivation: { type: String },
    voteCount: { type: Number, default: 0 },
    promoted: { type: Boolean, default: false },
    promotedCandidateId: { type: Schema.Types.ObjectId, ref: "Candidate" },
  },
  { timestamps: true }
);

CandidateApplicationSchema.index({ email: 1 }, { unique: true });
CandidateApplicationSchema.index({ createdAt: -1 });

const CandidateApplication: Model<ICandidateApplication> =
  mongoose.models.CandidateApplication ||
  mongoose.model<ICandidateApplication>("CandidateApplication", CandidateApplicationSchema);

export default CandidateApplication;
