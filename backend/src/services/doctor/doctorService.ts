
import { IDoctorService } from "../../interfaces/Service/IDoctorService";
import { DoctorRepository } from "../../repositories/doctor/DoctorRepository";
import { DoctorOTPRepository } from "../../repositories/doctor/doctorOTPRepository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { IDoctor } from "../../models/doctorModel";
import { UpdateDoctorProfileData } from "../../interfaces/Doctor/doctor";

export class DoctorService implements IDoctorService {
  private doctorRepository: DoctorRepository;
  private doctorOTPRepository: DoctorOTPRepository;

  constructor(
    doctorRepository: DoctorRepository,
    doctorOTPRepository: DoctorOTPRepository
  ) {
    this.doctorRepository = doctorRepository;
    this.doctorOTPRepository = doctorOTPRepository;
  }

  async loginDoctor(email: string, password: string) {
    const doctor = await this.doctorRepository.findByEmail(email);
    if (!doctor) {
      return { success: false, message: "Invalid credentials" };
    }
    if (doctor.isBlocked) {
      return {
        success: false,
        message: "Your account has been blocked by the admin.",
      };
    }
    const isMatch = await bcryptjs.compare(password, doctor.password);
    if (isMatch) {
      const token = jwt.sign(
        { id: doctor._id },
        process.env.JWT_SECRET as string
      );
      return { success: true, token };
    } else {
      return { success: false, message: "Incorrect password" };
    }
  }

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
    return {
      success: true,
      message: "OTP sent to your email.",
      doctorId: doctor._id,
    };
  }

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

  async doctorResetPassword(email: string, token: string, password: string) {
    const doctor = await this.doctorRepository.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    });
    if (!doctor) {
      return { success: false, message: "Invalid or expired reset token" };
    }
    doctor.password = await bcryptjs.hash(password, 10);
    doctor.resetPasswordToken = null;
    doctor.resetPasswordExpire = null;
    await this.doctorRepository.saveDoctor(doctor);
    return { success: true, message: "Password updated successfully" };
  }

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

  async changeDoctorPassword(
    doctorId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<string> {
    if (!doctorId) {
      throw new Error("Doctor ID is required.");
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All fields are required.");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    const isMatch = await bcryptjs.compare(currentPassword, doctor.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    const salt = await bcryptjs.genSalt(10);
    doctor.password = await bcryptjs.hash(newPassword, salt);
    await this.doctorRepository.updatingDoctor(doctor);

    return "Password changed successfully.";
  }

  async getDashboardData(docId: string) {
    const appointments = await this.doctorRepository.getAppointments(docId);

    let earnings = 0;
    const patients: string[] = [];

    appointments.forEach((item: any) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: [...appointments].reverse().slice(0, 5),
    };

    return dashData;
  }

  async changeAvailability(docId: string): Promise<boolean> {
    const doctor = await this.doctorRepository.findById(docId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    const newAvailability = !doctor.available;
    await this.doctorRepository.updateAvailability(docId, newAvailability);
    return newAvailability;
  }

  async listDoctors(): Promise<IDoctor[]> {
    return this.doctorRepository.getAllDoctors();
  }

  async getDoctorProfile(docId: string): Promise<IDoctor | null> {
    return this.doctorRepository.getDoctorProfile(docId);
  }

  async updateDoctorProfile(
    docId: string,
    data: UpdateDoctorProfileData
  ): Promise<IDoctor> {
    if (!docId) {
      throw new Error("Doctor ID is required");
    }

    const updatedDoctor = await this.doctorRepository.updateDoctorProfile(
      docId,
      data
    );
    console.log("Updated Doctor:", updatedDoctor);
    if (!updatedDoctor) {
      throw new Error("Doctor not found");
    }

    return updatedDoctor;
  }
}
