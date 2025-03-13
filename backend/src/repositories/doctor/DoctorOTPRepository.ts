import DoctorOTP from "../../models/docOtpModel";

export class DoctorOTPRepository {
  async createOtp(otpData: { otp: string; doctorId: string; expiresAt: Date }) {
    return await DoctorOTP.create(otpData);
  }

  async findOtp(query: any) {
    return await DoctorOTP.findOne(query);
  }

  async deleteOtp(query: any) {
    return await DoctorOTP.deleteOne(query);
  }

  async upsertOtp(doctorId: string, otp: string, expiresAt: Date) {
    return await DoctorOTP.findOneAndUpdate(
      { doctorId },
      { otp, expiresAt },
      { upsert: true, new: true }
    );
  }
}
