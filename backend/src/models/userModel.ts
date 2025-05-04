import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  address: {
    line1: string;
    line2: string;
  };
  gender: string;
  dob: string;
  phone: string;
  medicalHistory: string;
  isVerified: boolean;
  otp: string | null;
  otpExpires: Date | null;
  isBlocked: boolean;
  walletBalance: number;
  resetPasswordToken: string | null;
  resetPasswordExpire: Date | null;
  createdAt?: Date;
  updatedAt?: Date;  
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: {
      type: String,
      default: "data:image/png;base64,...", 
    },
    address: {
      line1: { type: String },
      line2: { type: String },
    },
    gender: { type: String },
    dob: { type: String },
    phone: { type: String },
    medicalHistory: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
  },
  { timestamps: true } 
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
