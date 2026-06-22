import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVote extends Document {
  userId: string;
  candidateId: string;
  studentId?: string;
  voterEmail?: string;
  voterName?: string;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    userId: { type: String, required: true },
    candidateId: { type: String, required: true },
    studentId: { type: String },
    voterEmail: { type: String },
    voterName: { type: String },
  },
  { timestamps: true }
);

VoteSchema.index({ userId: 1 }, { unique: true });

const Vote: Model<IVote> =
  mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);

export default Vote;
