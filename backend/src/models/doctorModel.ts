import mongoose, { Document, Model, Schema } from "mongoose";

<<<<<<< HEAD
export interface IBookedSlot {
  startTime: string;
  isBooked: boolean;
}

=======
// Define AvailableSlot type
interface AvailableSlot {
  startTime: string;
  endTime: string;
}

// TypeScript interface for the Doctor schema
>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97
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
<<<<<<< HEAD
  slots_booked: { [slotDate: string]: IBookedSlot[] };  
=======
  slots_booked: Record<string, any>; 
  slots: { slotDate: string; slotTime: string; }[];
  availableSlots: Record<string, AvailableSlot[]>; // Reference the AvailableSlot type correctly
>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97
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
<<<<<<< HEAD
=======
    slots: { type: [Object], default: [] },
    availableSlots: { type: Object, of: { startTime: String, endTime: String }, default: {} }, // Correctly define availableSlots with types
>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97
    isBlocked: { type: Boolean, default: false },
  },
  { minimize: false }
);

const doctorModel: Model<IDoctor> =
  mongoose.models.doctor || mongoose.model<IDoctor>("doctor", doctorSchema);

export default doctorModel;
