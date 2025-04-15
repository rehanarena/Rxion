import OTP from "../../models/otpModel";
import { IOtpRepository } from "../../interfaces/Repository/IOtpRepository";

export class OTPRepository implements IOtpRepository {
  async createOTP(userId: string, otp: string, expiresAt: Date): Promise<any> {
    const otpData = new OTP({ userId, otp, expiresAt });
    return await otpData.save();
  }

  async findOtp(otp: string, userId: string) {
    return await OTP.findOne({ otp, userId });
  }

  async updateOtp(userId: string, otp: string, expiresAt: Date) {
    return await OTP.findOneAndUpdate(
      { userId },
      { otp, expiresAt },
      { upsert: true, new: true }
    );
  }

  async deleteOtp(otp: string) {
    return await OTP.deleteOne({ otp });
  }
}
