import mongoose, { Schema, Document } from "mongoose";

// otpModel.ts
export interface IOtpDocument extends Document {
  otp: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtpDocument>({
  otp: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
});

const OTP = mongoose.model<IOtpDocument>("OTP", otpSchema);
export default OTP;

