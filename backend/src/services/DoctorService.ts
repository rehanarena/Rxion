// services/DoctorService.ts
import { DoctorRepository } from '../repositories/DoctorRepository';
import { DoctorOTPRepository } from '../repositories/DoctorOTPRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { ObjectId } from "mongodb"; 

interface SearchParams {
  speciality?: string;
  search?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

export class DoctorService {
  private doctorRepository: DoctorRepository;
  private doctorOTPRepository: DoctorOTPRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
    this.doctorOTPRepository = new DoctorOTPRepository();
  }

  async searchDoctors(params: SearchParams) {
    const { speciality, search, sortBy, page = "1", limit = "8" } = params;
    let query: any = {};

    if (speciality) {
      query.speciality = speciality;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { speciality: { $regex: search, $options: "i" } },
      ];
    }

    let sortOptions: any = {};
    // If sorting by availability, we add a filter instead of a sort.
    if (sortBy === "availability") {
      query.available = true;
    } else if (sortBy === "fees") {
      sortOptions.fees = 1; // ascending order
    } else if (sortBy === "experience") {
      sortOptions.experience = -1; // descending order
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;
    const skip = (pageNum - 1) * limitNum;

    const doctors = await this.doctorRepository.searchDoctors(query, sortOptions, skip, limitNum);
    const totalDoctors = await this.doctorRepository.countDoctors(query);

    return {
      totalPages: Math.ceil(totalDoctors / limitNum),
      currentPage: pageNum,
      totalDoctors,
      doctors,
    };
  }
   // Login doctor
   async loginDoctor(email: string, password: string) {
    const doctor = await this.doctorRepository.findByEmail(email);
    if (!doctor) {
      return { success: false, message: "Invalid credentials" };
    }
    if (doctor.isBlocked) {
      return { success: false, message: "Your account has been blocked by the admin." };
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET as string);
      return { success: true, token };
    } else {
      return { success: false, message: "Incorrect password" };
    }
  }

  // Generate OTP for forgot password
  async doctorForgotPasswordOTP(email: string) {
    const doctor = await this.doctorRepository.findByEmail(email);
    if (!doctor) {
      throw { status: 404, message: "Doctor not found" };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log("Generated OTP:", otp);
    await this.doctorOTPRepository.createOtp({
      otp,
      doctorId: doctor._id as string,
      expiresAt,
    });
    const message = `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`;
    await this.sendOtpEmail(doctor.email, "Doctor Password Reset OTP", message);
    return { success: true, message: "OTP sent to your email.", doctorId: doctor._id };
  }

  // Verify OTP and create a reset token
  async verifyDoctorOtp(doctorId: string, otp: string) {
    if (!doctorId || !ObjectId.isValid(doctorId)) {
      throw { status: 400, message: "Invalid doctorId." };
    }
    const otpData = await this.doctorOTPRepository.findOtp({ otp, doctorId });
    if (!otpData) {
      return { success: false, message: "OTP is invalid" };
    }
    if (otpData.expiresAt < new Date()) {
      return { success: false, message: "OTP has expired" };
    }
    const doctor = await this.doctorRepository.findById(doctorId);
    if (doctor) {
      await this.doctorOTPRepository.deleteOtp({ otp, doctorId });
      const resetToken = crypto.randomBytes(20).toString("hex");
      doctor.resetPasswordToken = resetToken;
      doctor.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
      await this.doctorRepository.saveDoctor(doctor);
      return {
        success: true,
        message: "Doctor verified successfully. You can reset your password now.",
        isForPasswordReset: true,
        doctorId,
        email: doctor.email,
        token: resetToken,
      };
    } else {
      return { success: false, message: "Doctor not found" };
    }
  }

  // Resend OTP
  async resendDoctorOtp(doctorId: string) {
    if (!doctorId || !ObjectId.isValid(doctorId)) {
      throw { status: 400, message: "Invalid doctorId." };
    }
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw { status: 404, message: "Doctor not found." };
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.doctorOTPRepository.upsertOtp(doctorId, newOtp, expiresAt);
    const emailBody = `
Hello ${doctor.name || "Doctor"},

Your OTP code is: ${newOtp}
This OTP is valid for the next 10 minutes.

If you did not request this, please ignore this email.

Regards,
Rxion Team
    `;
    await this.sendOtpEmail(doctor.email, "Resend OTP", emailBody);
    return { success: true, message: "OTP has been resent to your email." };
  }

  // Reset password using the reset token
  async doctorResetPassword(email: string, token: string, password: string) {
    const doctor = await this.doctorRepository.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    });
    if (!doctor) {
      return { success: false, message: "Invalid or expired reset token" };
    }
    doctor.password = await bcrypt.hash(password, 10);
    doctor.resetPasswordToken = null;
    doctor.resetPasswordExpire = null;
    await this.doctorRepository.saveDoctor(doctor);
    return { success: true, message: "Password updated successfully" };
  }

  // Utility method to send OTP emails
  private async sendOtpEmail(to: string, subject: string, text: string) {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }

}
