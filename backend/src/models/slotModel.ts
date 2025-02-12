
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISlot extends Document {
  doctorId: mongoose.Types.ObjectId; 
  date: string; 
  startTime: string;  
  endTime: string;    
  isBooked: boolean;
}

const slotSchema: Schema<ISlot> = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },  
    endTime: { type: String, required: true },    
    isBooked: { type: Boolean, default: false },
  },
  { minimize: false }
);

const slotModel: Model<ISlot> = mongoose.models.slot || mongoose.model<ISlot>("slot", slotSchema);

export default slotModel;
