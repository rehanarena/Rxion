import { UserRepository } from "../../repositories/user/UserRepository";
import { OTPRepository } from "../../repositories/user/OTPRepository";
import { TokenRepository } from "../../repositories/user/TokenRepository";
import bcryptjs from "bcryptjs"
import validator from "validator";
import { generateOTP } from "../../utils/generateOTP";
import { sendOtpEmail } from "../../helper/mailer";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { Address } from "../../interfaces/IAddress";
import { IUser} from "../../models/userModel";
import crypto from "crypto";

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private otpRepository: OTPRepository;
  private tokenRepository: TokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.otpRepository = new OTPRepository();
    this.tokenRepository = new TokenRepository();
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
      throw new Error("Enter a strong password");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await this.userRepository.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const otp = generateOTP(6);
    console.log(otp);
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
  
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
  
    // Mark user as verified
    user.isVerified = true;
    await this.userRepository.updateUser(user);
  
    // Delete the used OTP
    await this.otpRepository.deleteOtp(otp);
  
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await this.userRepository.saveUser(user);
  
    return {
      userId,
      isForPasswordReset: true,
      message: "User verified successfully. You can reset your password now.",
      email: user.email,  // Return the user's email
      token: resetToken,  // Return the generated reset token
    };
  }
  
  async resendOtp(userId: string) {
    const user = await this.userRepository.findById(userId);
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
    const user = await this.userRepository.findByEmail(email);
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

    let user = await this.userRepository.findByEmail(email);
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

      const newUser = await this.userRepository.createUser({
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
    } catch (error: any) {
      console.error(error);
      throw new Error("Invalid or expired refresh token");
    }
  }
  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
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
      userId: String(user._id)  // Include the userId here
    };
  }
  async userResetPassword(email: string, token: string, password: string) {
      const user = await this.userRepository.findOne({
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
      await this.userRepository.saveUser(user);
      return { success: true, message: "Password updated successfully" };
    }
  
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<string> {
    if (!userId) {
      throw new Error("User ID is required.");
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All fields are required.");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    await this.userRepository.updateUser(user);

    return "Password changed successfully.";
  }
  async getProfile(userId: string) {
    const userData = await this.userRepository.findByIdWithoutPassword(userId);
    if (!userData) {
      throw new Error("User not found");
    }
    return userData;
  }
  async updateProfile(
    userId: string,
    name: string,
    phone: string,
    address: string,
    dob: string,
    gender: string,
    imageFile?: Express.Multer.File,
    medicalHistory?: string 
  ): Promise<{ message: string }> {
    if (!userId || !name || !phone || !address || !dob || !gender) {
      throw new Error("Enter details in all missing fields");
    }
    const parsedAddress = JSON.parse(address) as Address;
  
    // Build the update data object including medicalHistory if provided
    const updateData: Partial<IUser> = {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    };
  
    if (medicalHistory) {
      updateData.medicalHistory = medicalHistory;
    }
  
    // Update the user profile with the new data
    await this.userRepository.updateProfile(userId, updateData);
  
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await this.userRepository.updateProfile(userId, { image: imageURL });
    }
  
    return { message: "Profile updated" };
  }
  
}
