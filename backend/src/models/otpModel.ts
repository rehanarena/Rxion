import mongoose, { Document, Schema } from 'mongoose';

interface IOtpData extends Document {
  userId: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtpData>(
  {
    userId: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      expires: 300, // 300 seconds = 5 minutes
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create an index on the `expiresAt` field to enable TTL
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpData = mongoose.model<IOtpData>('OtpData', otpSchema);

export default OtpData;
