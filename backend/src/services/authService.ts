// services/authService.ts
import { UserRepository } from '../repositories/UserRepository';
import { OTPRepository } from '../repositories/OTPRepository';
import { TokenRepository } from '../repositories/TokenRepository';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { generateOTP } from '../utils/generateOTP';
import { sendOtpEmail } from '../helper/mailer';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from "cloudinary";
import { Address } from '../interfaces/IAddress'; 

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

    // Validate required fields
    if (!name || !email || !password) {
      throw new Error("Enter details in all fields");
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Validate password type
    if (typeof password !== "string") {
      throw new Error("Password must be a string");
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      throw new Error("Enter a valid email");
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error("Enter a strong password");
    }

    // Check if the user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await this.userRepository.createUser({
      name,
      email,
      password: hashedPassword,
    });

    // Generate OTP and send email
    const otp = generateOTP(6);
    console.log(otp);
    await sendOtpEmail(email, otp);

    // Save OTP data with expiration time (10 minutes from now)
    await this.otpRepository.createOTP(
      user._id as string,
      otp,
      new Date(Date.now() + 10 * 60 * 1000)
    );

    return user;
  }

  async verifyOtp(otp: string, userId: string) {
    // Retrieve OTP record
    const otpData = await this.otpRepository.findOtp(otp, userId);
    if (!otpData) {
      throw new Error("OTP is invalid");
    }

    // Check OTP expiration
    if (otpData.expiresAt < new Date()) {
      throw new Error("OTP has expired");
    }

    // Find the user by userId
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user's verification status
    user.isVerified = true;
    await this.userRepository.updateUser(user);

    // Remove the OTP record after successful verification
    await this.otpRepository.deleteOtp(otp);

    return {
      userId,
      isForPasswordReset: true,
      message: "User verified successfully. You can log in now.",
    };
  }

  async resendOtp(userId: string) {
    // Find the user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Generate a new OTP
    const newOtp = generateOTP(6);
    console.log(`resend ${newOtp}`);

    // Update (or create) the OTP record for the user
    await this.otpRepository.updateOtp(
      userId,
      newOtp,
      new Date(Date.now() + 10 * 60 * 1000)
    );

    // Construct the email body
    const emailBody = `
      Hello ${user.name || "User"},
      
      Your OTP code is: ${newOtp}
      This OTP is valid for the next 10 minutes.
      
      If you did not request this, please ignore this email.
      
      Regards,
      Rxion Team
    `;

    // Send the OTP email
    await sendOtpEmail(user.email, emailBody);

    return { message: "OTP has been resent to your email." };
  }

  // Accepts an optional expiration value.
  private generateAccessToken(userId: string, expiresIn: string = "49m"): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Convert user._id to string
    const userId = String(user._id);
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    // Save refresh token via token repository
    this.tokenRepository.setToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async googleAuth(email: string, name: string, photo: string) {
    if (!name || !email || !photo) {
      throw new Error("Name, email, and photo are required");
    }
    
    let user = await this.userRepository.findByEmail(email);
    if (user) {
      const token = this.generateAccessToken(String(user._id), "45m");
      return { status: 200, user, token };
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

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
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
      // Get the stored refresh token from the repository
      const storedToken = this.tokenRepository.getToken(decoded.id);
      if (storedToken !== refreshToken) {
        throw new Error("Invalid refresh token");
      }
      // Generate a new access token (you can adjust the expiration as needed)
      const newAccessToken = this.generateAccessToken(decoded.id);
      return newAccessToken;
    } catch (error: any) {
      console.error(error);
      // If the error is due to token expiration, you might handle it differently.
      throw new Error("Invalid or expired refresh token");
    }
  }
  async forgotPassword(email: string) {
    // Check if user exists
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate a 6-digit OTP
    const otp = generateOTP(6);

    // Save the OTP record (expires in 10 minutes)
    await this.otpRepository.createOTP(String(user._id), otp, new Date(Date.now() + 10 * 60 * 1000));

    // Construct email body
    const emailBody = `
      Hello ${user.name || "User"},

      Your OTP code for resetting your password is: ${otp}
      This OTP is valid for the next 10 minutes.

      If you did not request this, please ignore this email.

      Regards,
      Rxion Team
    `;

    // Send OTP email
    await sendOtpEmail(email, emailBody);

    return { message: "OTP sent to your email. Please verify to reset password." };
  }
  async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<string> {
    // Validate required fields
    if (!userId) {
      throw new Error("User ID is required.");
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All fields are required.");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // Find the user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    // Hash the new password and update the user record
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
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
    imageFile?: Express.Multer.File
  ): Promise<{ message: string }> {
    // Validate required fields
    if (!userId || !name || !phone || !address || !dob || !gender) {
      throw new Error("Enter details in all missing fields");
    }

    // Parse the address JSON (ensure client sends address as a valid JSON string)
    const parsedAddress = JSON.parse(address) as Address;

    // First update text fields (name, phone, address, dob, gender)
    await this.userRepository.updateProfile(userId, {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    });

    // If there's an image file, upload it to Cloudinary and update the user record
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
