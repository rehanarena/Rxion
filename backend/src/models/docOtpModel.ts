import mongoose, { Schema, Document } from 'mongoose';

interface IOTP extends Document {
  otp: string;
  doctorId: mongoose.Schema.Types.ObjectId;
  expiresAt: Date;
}

const otpSchema = new Schema<IOTP>({
  otp: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  expiresAt: { type: Date, required: true },
});

const DoctorOTP = mongoose.models.DoctorOTP || mongoose.model<IOTP>('DoctorOTP', otpSchema);
export default DoctorOTP;
