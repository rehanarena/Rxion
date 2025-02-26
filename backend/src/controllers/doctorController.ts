import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appoinmentModel";
import Slot from "../models/slotModel";
import { RRule } from "rrule";
import moment from "moment";
import DoctorOTP from "../models/docOtpModel";
import { sendOtpEmail } from "../helper/mailer"; 
import crypto from 'crypto'
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import nodemailer from 'nodemailer';


interface AddSlotsRequestBody {
  doctorId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

interface Doctor {
  _id: string;
  email: string;
  password: string;
  available: boolean;
  isBlocked: boolean;
}

interface SlotRequestBody {
  doctorId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  timeSlots: string[];
  startTime: string;  
  endTime: string;  
}

interface SlotData {
  doctorId: string;
  date: string;
  isBooked: boolean;
  startTime: string;
  endTime: string;
}


const loginDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const doctor: Doctor | null = await doctorModel.findOne({ email });

    if (!doctor) {
      res.json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (doctor.isBlocked) {
      res.json({
        success: false,
        message: "Your account has been blocked by the admin.",
      });
      return;
    }

    const isMatch: boolean = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token: string = jwt.sign(
        { id: doctor._id },
        process.env.JWT_SECRET as string
      );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Incorrect password" });
    }
  } catch (error: any) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify OTP endpoint
export const verifyDoctorOtp = async (req: Request, res: Response): Promise<void> => {
  const { otp, doctorId } = req.body;

  if (!doctorId || !ObjectId.isValid(doctorId)) {
    res.status(400).json({ success: false, message: "Invalid doctorId." });
    return;
  }

  try {
    const otpData = await DoctorOTP.findOne({ otp, doctorId });
    if (!otpData) {
      res.json({ success: false, message: "OTP is invalid" });
      return;
    }

    if (otpData.expiresAt < new Date()) {
      res.json({ success: false, message: "OTP has expired" });
      return;
    }

    const doctor = await doctorModel.findById(doctorId);
    if (doctor) {
      // Remove OTP record once verified
      await DoctorOTP.deleteOne({ otp, doctorId });
      
      // Generate a reset token and set its expiration (e.g., 10 minutes)
      const resetToken = crypto.randomBytes(20).toString("hex");
      doctor.resetPasswordToken = resetToken;
      doctor.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await doctor.save();

      res.json({
        success: true,
        message: "Doctor verified successfully. You can reset your password now.",
        isForPasswordReset: true,
        doctorId,
        email: doctor.email,  // Include doctor's email
        token: resetToken,    // Include the generated reset token
      });
      return;
    } else {
      res.json({ success: false, message: "Doctor not found" });
      return;
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};
// Resend OTP endpoint
export const resendDoctorOtp = async (req: Request, res: Response): Promise<void> => {
  const { doctorId } = req.body;

  if (!doctorId || !ObjectId.isValid(doctorId)) {
     res.status(400).json({ success: false, message: "Invalid doctorId." });
     return
  }

  try {
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
       res.status(404).json({ success: false, message: "Doctor not found." });
       return
    }

    // Generate a new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update (or create) the OTP record using DoctorOTP model
    const otpData = await DoctorOTP.findOneAndUpdate(
      { doctorId },
      {
        otp: newOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // Construct email body
    const emailBody = `
      Hello ${doctor.name || "Doctor"},
      
      Your OTP code is: ${newOtp}
      This OTP is valid for the next 10 minutes.
      
      If you did not request this, please ignore this email.
      
      Regards,
      Rxion Team
    `;

    await sendOtpEmail(doctor.email, emailBody);

    res.json({ success: true, message: "OTP has been resent to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resending the OTP. Please try again later.",
    });
  }
};


export const doctorForgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
       res.status(404).json({ success: false, message: "Doctor not found" });
       return
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP in the DoctorOTP collection
    const otpRecord = await DoctorOTP.create({
      otp,
      doctorId: doctor._id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
    });

    // Prepare email message with OTP
    const message = `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`;

    // Configure nodemailer (example using Gmail)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: doctor.email,
      subject: "Doctor Password Reset OTP",
      text: message,
    });

    res.status(200).json({ success: true, message: "OTP sent to your email.", doctorId: doctor._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Reset password using OTP
export const doctorResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token, password } = req.body;

    // Find the doctor by email and verify the token and its expiration
    const doctor = await doctorModel.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!doctor) {
      res.status(400).json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    // Hash the new password and update the doctor record
    doctor.password = await bcrypt.hash(password, 10);
    // Clear the reset token fields
    doctor.resetPasswordToken = null;
    doctor.resetPasswordExpire = null;
    await doctor.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const doctorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    let earnings = 0;
    let patients = 0;
    let appointments = 0;

    const dashData = {
      earnings,
      appointments,
      patients,
    };
    res.json({ success: true, dashData });
  } catch (error: any) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const changeAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId } = req.body;

    const docData: Doctor | null = await doctorModel.findById(docId);
    if (!docData) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while changeAvailability.",
    });
  }
};
const doctorList = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while fetching doctors.",
    });
  }
};
export const doctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel
      .findById(docId)
      .select("-password");
    res.json({ success: true, profileData });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
 export const updateDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, fees, address, available } = req.body;

    if (!docId) {
      res.json({ success: false, message: "Doctor ID is required" });
      return 
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,
      { fees, address, available },
      { new: true } 
    );

    if (!updatedDoctor) {
      res.json({ success: false, message: "Doctor not found" });
      return 
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while fetching slots.",
    });
  }
};


export const slot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.params;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 30); 

    const slots = await Slot.find({
      doctorId: docId, 
      isBooked: false,
      startTime: { $gte: currentTime.toISOString() }, 
    }).sort({ startTime: 1 });

    // console.log('Fetched slots:', slots);
    res.json({ success: true, slots });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while fetching slots.",
    });
  }
};
/// ADD Slots ///
export const addSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } = req.body;

    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new Error("Days of week are required.");
    }

    if (!startTime || !endTime) {
      throw new Error("Start and End times are required.");
    }

    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: new Date(startDate),
      until: new Date(endDate),
      byweekday: daysOfWeek.map((day: string) => {
        switch (day.toUpperCase()) {
          case 'MO': return RRule.MO;
          case 'TU': return RRule.TU;
          case 'WE': return RRule.WE;
          case 'TH': return RRule.TH;
          case 'FR': return RRule.FR;
          case 'SA': return RRule.SA;
          case 'SU': return RRule.SU;
          default: throw new Error(`Invalid day: ${day}`);
        }
      }),
    });

    const slotDates = rule.all();
    const slotsToSave: SlotData[] = [];
    const now = new Date();

    for (const date of slotDates) {
      const startSlotTime = new Date(date);
      const endSlotTime = new Date(date);

      startSlotTime.setHours(parseInt(startTime.split(':')[0]));
      startSlotTime.setMinutes(parseInt(startTime.split(':')[1]));

      endSlotTime.setHours(parseInt(endTime.split(':')[0]));
      endSlotTime.setMinutes(parseInt(endTime.split(':')[1]));

      if (isNaN(startSlotTime.getTime()) || isNaN(endSlotTime.getTime())) {
        throw new Error("Invalid time values.");
      }
      if (startSlotTime < now) {
        continue;
      }

      const istStartTime = moment(startSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
      const istEndTime = moment(endSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

      const existingSlot = await Slot.findOne({ doctorId, date: istStartTime });
      if (existingSlot) {
        continue; 
      }

      slotsToSave.push({
        doctorId,
        date: istStartTime,
        startTime: istStartTime,
        endTime: istEndTime,
        isBooked: false,
      });
    }

    if (slotsToSave.length > 0) {
      await Slot.insertMany(slotsToSave);
      res.json({ success: true, message: 'Slots added successfully!' });
    } else {
      res.json({ success: false, message: 'Already exist or Past Time cannot be add' });   
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};


/// getSlots ///
export const getSlotsByDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params; 

    const slots = await Slot.find({ doctorId });

    res.json({ success: true, slots });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
/// delete Slot ///
export const deleteSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId } = req.params;

    const deletedSlot = await Slot.findByIdAndDelete(slotId);

    if (!deletedSlot) {
      throw new Error("Slot not found");
    }

    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
/// edit slot ///
export const editSlot = async(req:Request, res:Response): Promise<void> =>{
  const { startTime, endTime } = req.body;
  const { slotId } = req.params;

  try {
    const updatedSlot = await Slot.findByIdAndUpdate(
      slotId,
      { startTime, endTime },
      { new: true } 
    );

    if (!updatedSlot) {
       res.status(404).json({ message: 'Slot not found' });
       return
    }

    res.json({
      message: 'Slot updated successfully',
      slot: updatedSlot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

/// appoinments ///
const appoinmentsDoctor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while fetching appoinments.",
    });
  }
};
/// appointment complete ///
const appoinmentComplete = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      res.json({ success: true, message: "Appointment Completed" });
      return;
    } else {
      res.json({ success: false, message: "Mark Failed" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while complete appoinments.",
    });
  }
};

/// appointment Cancel ///
const appoinmentCancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      res.json({ success: true, message: "Appointment Cancelled" });
      return;
    } else {
      res.json({ success: false, message: "cancellation Failed" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while complete appoinments.",
    });
  }
};

export {
  loginDoctor,
  doctorDashboard,
  changeAvailability,
  doctorList,
  appoinmentsDoctor,
  appoinmentComplete,
  appoinmentCancel,
};