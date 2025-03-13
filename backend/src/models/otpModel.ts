import mongoose, { Schema, Document } from "mongoose";

interface IOTP extends Document {
  otp: string;
  userId: mongoose.Schema.Types.ObjectId;
  expiresAt: Date;
}

const otpSchema = new Schema<IOTP>({
  otp: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
});

const OTP = mongoose.model<IOTP>("OTP", otpSchema);
export default OTP;
