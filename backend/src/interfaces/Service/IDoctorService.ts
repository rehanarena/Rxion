import { IDoctor } from "../../models/doctorModel";
import { UpdateDoctorProfileData } from "../../interfaces/Doctor/doctor";

export interface IDoctorService {
  loginDoctor(email: string, password: string): Promise<any>;
  doctorForgotPasswordOTP(email: string): Promise<any>;
  verifyDoctorOtp(doctorId: string, otp: string): Promise<any>;
  resendDoctorOtp(doctorId: string): Promise<any>;
  doctorResetPassword(
    email: string,
    token: string,
    password: string
  ): Promise<any>;
  changeDoctorPassword(
    doctorId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<string>;
  getDashboardData(docId: string): Promise<any>;
  changeAvailability(docId: string): Promise<boolean>;
  listDoctors(): Promise<IDoctor[]>;
  getDoctorProfile(docId: string): Promise<IDoctor | null>;
  updateDoctorProfile(
    docId: string,
    data: UpdateDoctorProfileData
  ): Promise<IDoctor>;
}
