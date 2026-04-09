import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICandidate extends Document {
  name: string;
  role: string;
  image: string;
  bio: string;
  voteCount: number;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String },
    bio: { type: String, required: true },
    voteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Candidate: Model<ICandidate> =
  mongoose.models.Candidate ||
  mongoose.model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;
