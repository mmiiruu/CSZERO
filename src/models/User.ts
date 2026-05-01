import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  emailVerified: Date | null;
  hasVoted: boolean;
  image?: string;
  role: "user" | "staff" | "admin";
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    emailVerified: { type: Date, default: null },
    hasVoted: { type: Boolean, default: false },
    image: { type: String },
    role: { type: String, enum: ["user", "staff", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Optimize dashboard sorting
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
