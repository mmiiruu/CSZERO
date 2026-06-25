import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInterviewSlot extends Document {
  date: string;
  startTime: string;
  endTime: string;
  bookedBy?: Types.ObjectId;
  bookedByEmail?: string;
  createdAt: Date;
}

const InterviewSlotSchema = new Schema<IInterviewSlot>(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    bookedBy: { type: Schema.Types.ObjectId, ref: "ClubApplication" },
    bookedByEmail: { type: String },
  },
  { timestamps: true }
);

InterviewSlotSchema.index({ date: 1, startTime: 1 }, { unique: true });
InterviewSlotSchema.index({ bookedByEmail: 1 }, { unique: true, sparse: true });

const InterviewSlot: Model<IInterviewSlot> =
  mongoose.models.InterviewSlot ||
  mongoose.model<IInterviewSlot>("InterviewSlot", InterviewSlotSchema);

export default InterviewSlot;
