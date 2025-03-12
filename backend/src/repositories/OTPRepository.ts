// repositories/OTPRepository.ts
import OTP from '../models/otpModel';

export class OTPRepository {
  async createOTP(userId: string, otp: string, expiresAt: Date) {
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
