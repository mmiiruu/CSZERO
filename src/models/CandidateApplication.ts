import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICandidateApplication extends Document {
  name: string;
  email: string;
  studentId: string;
  year: string;
  role: string;
  bio: string;
  motivation: string;
  image?: string;
  promoted: boolean;
  promotedCandidateId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateApplicationSchema = new Schema<ICandidateApplication>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentId: { type: String, required: true },
    year: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    motivation: { type: String, required: true },
    image: { type: String },
    promoted: { type: Boolean, default: false },
    promotedCandidateId: { type: Schema.Types.ObjectId, ref: "Candidate" },
  },
  { timestamps: true }
);

// One application per email — re-submission would just edit (out of scope here)
CandidateApplicationSchema.index({ email: 1 }, { unique: true });
CandidateApplicationSchema.index({ createdAt: -1 });

const CandidateApplication: Model<ICandidateApplication> =
  mongoose.models.CandidateApplication ||
  mongoose.model<ICandidateApplication>("CandidateApplication", CandidateApplicationSchema);

export default CandidateApplication;
