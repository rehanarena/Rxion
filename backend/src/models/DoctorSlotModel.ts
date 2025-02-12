// models/DoctorSchedule.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITimeSlot {
  time: string; // e.g. "10:00 AM"
  status: "available" | "booked" | "break" | "rescheduled";
}

export interface IDoctorSchedule extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  timeSlots: ITimeSlot[];
}

const timeSlotSchema: Schema<ITimeSlot> = new Schema({
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "booked", "break", "rescheduled"],
    default: "available",
  },
});

const doctorScheduleSchema: Schema<IDoctorSchedule> = new Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: Date, required: true },
  timeSlots: [timeSlotSchema],
});

const DoctorSchedule: Model<IDoctorSchedule> =
  mongoose.models.DoctorSchedule ||
  mongoose.model<IDoctorSchedule>("DoctorSchedule", doctorScheduleSchema);

export default DoctorSchedule;
