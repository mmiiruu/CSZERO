import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistration extends Document {
  event: "cs101" | "hello-world";
  name: string;
  email: string;
  answers: Record<string, unknown>;
  house?: "spade" | "heart" | "diamond" | "club";
  createdAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    event: {
      type: String,
      required: true,
      enum: ["cs101", "hello-world"],
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    answers: { type: Schema.Types.Mixed, default: {} },
    house: {
      type: String,
      enum: ["spade", "heart", "diamond", "club"],
    },
  },
  { timestamps: true }
);

// Unique constraint: one registration per email per event
RegistrationSchema.index({ email: 1, event: 1 }, { unique: true });

// Optimize dashboard sorting
RegistrationSchema.index({ createdAt: -1 });

const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
