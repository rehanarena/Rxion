export interface IOtpRepository {
  createOTP(userId: string, otp: string, expiresAt: Date): Promise<any>;
  findOtp(otp: string, userId: string): Promise<any>;
  deleteOtp(otp: string): Promise<any>;
  updateOtp(userId: string, otp: string, expiresAt: Date): Promise<any>;
}
