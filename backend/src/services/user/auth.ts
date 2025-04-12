import bcryptjs from "bcryptjs";
import validator from "validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { RegisterRequestBody } from "../../interfaces/User/user";
import { AuthRepository } from "../../repositories/user/authRepository";
import { OTPRepository } from "../../repositories/user/otpRepository";
import { TokenRepository } from "../../repositories/user/tokenRepository";
import { generateOTP } from "../../utils/generateOTP";
import { sendOtpEmail } from "../../helper/mailer";

export class AuthService {
  private authRepository: AuthRepository;
  private otpRepository: OTPRepository;
  private tokenRepository: TokenRepository;

  /// Dependency injected ///
  constructor(
    authRepository: AuthRepository,
    otpRepository: OTPRepository,
    tokenRepository: TokenRepository
  ) {
    this.authRepository = authRepository;
    this.otpRepository = otpRepository;
    this.tokenRepository = tokenRepository;
  }

  async registerUser(data: RegisterRequestBody) {
    const { name, email, password, confirmPassword } = data;

    if (!name || !email || !password) {
      throw new Error("Enter details in all fields");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (typeof password !== "string") {
      throw new Error("Password must be a string");
    }

    if (!validator.isEmail(email)) {
      throw new Error("Enter a valid email");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(password)) {
      throw new Error("Password must include at least one special character");
    }

    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await this.authRepository.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const otp = generateOTP(6);
    console.log("Generated OTP:", otp);
    await sendOtpEmail(email, otp);

    await this.otpRepository.createOTP(
      user._id as string,
      otp,
      new Date(Date.now() + 10 * 60 * 1000)
    );

    return user;
  }
  async verifyOtp(otp: string, userId: string) {
    const otpData = await this.otpRepository.findOtp(otp, userId);
    if (!otpData) {
      throw new Error("OTP is invalid");
    }

    if (otpData.expiresAt < new Date()) {
      throw new Error("OTP has expired");
    }

    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.isVerified = true;
    await this.authRepository.saveUser(user);

    await this.otpRepository.deleteOtp(otp);

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await this.authRepository.saveUser(user);

    return {
      userId,
      isForPasswordReset: true,
      message: "User verified successfully. You can reset your password now.",
      email: user.email,
      token: resetToken,
    };
  }
  async resendOtp(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const newOtp = generateOTP(6);
    console.log(`resend ${newOtp}`);

    await this.otpRepository.updateOtp(
      userId,
      newOtp,
      new Date(Date.now() + 10 * 60 * 1000)
    );

    const emailBody = `
      Hello ${user.name || "User"},
      
      Your OTP code is: ${newOtp}
      This OTP is valid for the next 10 minutes.
      
      If you did not request this, please ignore this email.
      
      Regards,
      Rxion Team
    `;

    await sendOtpEmail(user.email, emailBody);

    return { message: "OTP has been resent to your email." };
  }
  private generateAccessToken(
    userId: string,
    expiresIn: string = "3d"
  ): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn,
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
  }
  async loginUser(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error("User does not exist");
    }

    if (user.isBlocked) {
      throw new Error("Your account has been blocked.");
    }

    if (!user.isVerified) {
      throw new Error("Please verify your email first.");
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const userId = String(user._id);
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    this.tokenRepository.setToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async googleAuth(email: string, name: string, photo: string) {
    if (!name || !email || !photo) {
      throw new Error("Name, email, and photo are required");
    }

    let user = await this.authRepository.findByEmail(email);
    if (user) {
      const token = this.generateAccessToken(String(user._id), "3d");
      return { status: 200, user, token };
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const username =
        name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-8);

      const newUser = await this.authRepository.createUser({
        name: username,
        email,
        password: hashedPassword,
        profilePicture: photo,
      });
      const token = this.generateAccessToken(String(newUser._id), "45m");
      return { status: 201, user: newUser, token };
    }
  }
  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    try {
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET as string
      );
      const storedToken = this.tokenRepository.getToken(decoded.id);
      if (storedToken !== refreshToken) {
        throw new Error("Invalid refresh token");
      }
      const newAccessToken = this.generateAccessToken(decoded.id);
      return newAccessToken;
    } catch (error) {
      console.error(error);
      throw new Error("Invalid or expired refresh token");
    }
  }
  async forgotPassword(email: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const otp = generateOTP(6);

    await this.otpRepository.createOTP(
      String(user._id),
      otp,
      new Date(Date.now() + 10 * 60 * 1000)
    );

    const emailBody = `
            Hello ${user.name || "User"},
        
            Your OTP code for resetting your password is: ${otp}
            This OTP is valid for the next 10 minutes.
        
            If you did not request this, please ignore this email.
        
            Regards,
            Rxion Team
          `;

    await sendOtpEmail(email, emailBody);

    return {
      message: "OTP sent to your email. Please verify to reset password.",
      userId: String(user._id),
    };
  }
  async userResetPassword(email: string, token: string, password: string) {
    const user = await this.authRepository.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    });
    if (!user) {
      return { success: false, message: "Invalid or expired reset token" };
    }
    user.password = await bcryptjs.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await this.authRepository.saveUser(user);
    return { success: true, message: "Password updated successfully" };
  }
}
