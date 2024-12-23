import { Request, Response } from "express";
import bcrypt from "bcrypt";
import OTP from "../models/otpModel";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel";
import { sendOtpEmail } from "../helper/mailer";
import { generateOTP } from "../utils/generateOTP";
import { ObjectId } from "mongodb";

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/// Register User////
const registerUser = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.json({ success: false, message: "Enter details in all fields" });
      return;
    }

    if (password !== confirmPassword) {
      res.json({ success: false, message: "Passwords do not match" });
      return;
    }

    if (typeof password !== "string") {
      res.json({ success: false, message: "Password must be a string" });
      return;
    }

    if (!validator.isEmail(email)) {
      res.json({ success: false, message: "Enter a valid email" });
      return;
    }

    if (password.length < 8) {
      res.json({ success: false, message: "Enter a strong password" });
      return;
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.json({ success: false, message: "Email already registered" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    const otp = generateOTP(6);
    console.log(otp);

    await sendOtpEmail(email, otp);

    const otpData = new OTP({
      userId: user._id,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otpData.save();

    res.json({
      success: true,
      token,
      userId: user._id,
      message: "OTP sent to email. Please verify.",
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// Verify Otp ///
const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { otp, userId } = req.body;

  if (!userId || !ObjectId.isValid(userId)) {
    res.status(400).json({ success: false, message: "Invalid userId." });
    return;
  }

  try {
    const otpData = await OTP.findOne({ otp, userId });

    if (!otpData) {
      res.json({ success: false, message: "OTP is invalid" });
      return;
    }

    if (otpData.expiresAt < new Date()) {
      res.json({ success: false, message: "OTP has expired" });
      return;
    }

    const user = await userModel.findById(userId);
    if (user) {
      user.isVerified = true;
      await user.save();
      await OTP.deleteOne({ otp });

      res.json({
        success: true,
        message: "User verified successfully. You can log in now.",
        isForPasswordReset: true,
        userId,
      });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

///resend otp///
const resendOtp = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId || !ObjectId.isValid(userId)) {
    res.status(400).json({ success: false, message: "Invalid userId." });
    return;
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const newOtp = generateOTP(6);
    console.log(`resend ${newOtp}`);

    const otpData = await OTP.findOneAndUpdate(
      { userId },
      {
        otp: newOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true, new: true }
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

    res.json({ success: true, message: "OTP has been resent to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while resending the OTP. Please try again later.",
    });
  }
};

/// Login User ///
const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User does not exist" });
      return;
    }

    if (user.isBlocked) {
      res.json({ success: false, message: "Your account has been blocked." });
      return;
    }

    if (!user.isVerified) {
      res.json({ success: false, message: "Please verify your email first." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// Forgot Password Request ///
const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    const otp = generateOTP(6);

    const otpData = new OTP({
      userId: user._id,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otpData.save();

    const emailBody = `
      Hello ${user.name || "User"},

      Your OTP code for resetting your password is: ${otp}
      This OTP is valid for the next 10 minutes.

      If you did not request this, please ignore this email.

      Regards,
      Rxion Team
    `;

    await sendOtpEmail(email, emailBody);

    res.json({
      success: true,
      message: "OTP sent to your email.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// Reset Password ///
const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword) {
    res.json({ success: false, message: "All fields are required." });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.json({ success: false, message: "Passwords do not match" });
    return;
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    const otpData = await OTP.findOne({ otp, userId: user._id });

    if (!otpData) {
      res.json({ success: false, message: "Invalid OTP" });
      return;
    }

    if (otpData.expiresAt < new Date()) {
      res.json({ success: false, message: "OTP has expired" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ otp });

    res.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
};
