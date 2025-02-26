import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBookedSlot {
  date: string;
  time: string;
}

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
  slots_booked: { [slotDate: string]: IBookedSlot[] };  
  isBlocked: boolean;
  otp: string | null; 
  otpExpires: Date | null; 
  resetPasswordToken: string | null;
  resetPasswordExpire: Date | null;
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
    isBlocked: { type: Boolean, default: false },
    otp: { type: String, default: null }, 
    otpExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
    
  },
  { minimize: false }
);

const doctorModel: Model<IDoctor> =
  mongoose.models.doctor || mongoose.model<IDoctor>("doctor", doctorSchema);

export default doctorModel;