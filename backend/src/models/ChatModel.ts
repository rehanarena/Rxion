import { Schema, model, Document } from "mongoose";

export interface IFileData {
  name?: string;
  url?: string;
}

export interface IChatMessage extends Document {
  room: string;
  sender: string;
  message: string;
  timestamp: Date;
  read: boolean;
  file?: IFileData | Record<string, unknown>; 
  patientName?: string;
  patientImage?: string;
}

const ChatSchema = new Schema<IChatMessage>({
  room: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  file: { type: Schema.Types.Mixed, default: undefined },
  patientName: { type: String, default: "" },
  patientImage: { type: String, default: "" },
});

export default model<IChatMessage>("ChatMessage", ChatSchema);
