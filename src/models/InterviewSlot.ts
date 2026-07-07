import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInterviewSlotBooking {
  applicationId: Types.ObjectId;
  email: string;
}

export interface IInterviewSlot extends Document {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookings: IInterviewSlotBooking[];
  createdAt: Date;
}

const InterviewSlotBookingSchema = new Schema<IInterviewSlotBooking>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "ClubApplication", required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const InterviewSlotSchema = new Schema<IInterviewSlot>(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, default: 4, min: 1 },
    bookings: { type: [InterviewSlotBookingSchema], default: [] },
  },
  { timestamps: true }
);

InterviewSlotSchema.index({ date: 1, startTime: 1 }, { unique: true });

const InterviewSlot: Model<IInterviewSlot> =
  mongoose.models.InterviewSlot ||
  mongoose.model<IInterviewSlot>("InterviewSlot", InterviewSlotSchema);

export default InterviewSlot;
