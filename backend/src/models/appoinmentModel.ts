import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: Record<string, unknown>;
  doctData: Record<string, unknown>;
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isCompleted?: boolean;
}

const appointmentSchema: Schema<IAppointment> = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  doctData: { type: Object },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  cancelled: { type: Boolean, required: false },
  payment: { type: Boolean, required: false },
  isCompleted: { type: Boolean, required: false },
}, { timestamps: true });

const appointmentModel: Model<IAppointment> =
  mongoose.models.appointment ||
  mongoose.model<IAppointment>("appointment", appointmentSchema);

export default appointmentModel;
