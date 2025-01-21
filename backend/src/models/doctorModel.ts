import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for the Doctor schema
export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  image: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  available: boolean;
  address: Record<string, any>; 
  date: number;
  slots_booked: Record<string, any>; 
  slots: { slotDate: string; slotTime: string; }[];
  availableSlots: Record<string, string[]>;  // New property
  isBlocked: boolean;
}

const doctorSchema: Schema<IDoctor> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    fees: { type: Number, required: true },
    available: { type: Boolean, default: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    slots: { type: [Object], default: [] },
    availableSlots: { type: Object, default: {} },  // New field to store available slots
    isBlocked: { type: Boolean, default: false },
  },
  { minimize: false }
);

const doctorModel: Model<IDoctor> =
  mongoose.models.doctor || mongoose.model<IDoctor>("doctor", doctorSchema);

export default doctorModel;
