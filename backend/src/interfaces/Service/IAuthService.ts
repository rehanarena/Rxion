import { RegisterRequestBody } from "../../interfaces/User/user";
import { IUser } from "../../models/userModel";

export interface IAuthService {
  registerUser(data: RegisterRequestBody): Promise<IUser>;
  verifyOtp(
    otp: string,
    userId: string
  ): Promise<{
    userId: string;
    isForPasswordReset: boolean;
    message: string;
    email: string;
    token: string;
  }>;
  resendOtp(userId: string): Promise<{ message: string }>;
  loginUser(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  googleAuth(
    email: string,
    name: string,
    photo: string
  ): Promise<{
    status: number;
    user: IUser;
    token: string;
  }>;
  refreshAccessToken(refreshToken: string): Promise<string>;
  forgotPassword(email: string): Promise<{ message: string; userId: string }>;
  userResetPassword(
    email: string,
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string }>;
}
