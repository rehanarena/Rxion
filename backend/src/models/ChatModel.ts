// models/ChatModel.ts
import { Schema, model, Document } from "mongoose";

export interface IChatMessage extends Document {
  room: string;
  sender: string;
  message: string;
  timestamp: Date;
  read: boolean;
  file?: {
    url: string;
    type: string;
    fileName: string;
  };
  patientName?: string;
  patientImage?: string;
}

const ChatSchema = new Schema<IChatMessage>({
  room: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  file: {
    url: String,
    type: String,
    fileName: String,
  },
  patientName: { type: String, default: "" },
  patientImage: { type: String, default: "" },
});

export default model<IChatMessage>("ChatMessage", ChatSchema);
