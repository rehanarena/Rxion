import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer'
import OTP from '../models/otpModel'
import jwt from 'jsonwebtoken';
import validator from 'validator';
import userModel  from '../models/userModel';
import { sendOtpEmail } from '../helper/mailer'


interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

const registerUser = async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    // Validate fields
    if (!name || !email || !password) {
       res.json({
        success: false,
        message: "Enter details in all fields",
      });
      return
    }
    if (typeof password !== "string") {
      res.json({ success: false, message: "Password must be a string" });
      return ;
    }
    if (!validator.isEmail(email)) {
      res.json({ success: false, message: "Enter a valid email" });
      return ;
    }
    if (password.length < 8) {
      res.json({ success: false, message: "Enter a strong password" });
      return ;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generates salt correctly
    if (!salt) {
      throw new Error("Failed to generate salt");
    }
    const hashedPassword = await bcrypt.hash(password, salt); // Hash password with valid salt

    // Save user data
    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });
    res.json({ success: true, token });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User does not exist" });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.json({ success: false, message: errorMessage });
  }
};

//verifyOtp
const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { val1, val2, val3, val4, val5, val6 } = req.body;
    const otp = val1 + val2 + val3 + val4 + val5 + val6; // Concatenate OTP values

    if (!req.session.verifyToken) {
      res.json({ success: false, message: 'Session timeout. Please log in again.' });
      return;
    }

    // Fetch OTP verification data
    const otpVerifyData = await OTP.findOne({ userId: req.session.verifyToken });
    if (!otpVerifyData) {
      res.json({ success: false, message: 'OTP expired. Please try logging in again.' });
      return;
    }

    // Compare the OTP
    const isOtpValid = await bcrypt.compare(otp, otpVerifyData.otp);
    if (!isOtpValid) {
      res.json({ success: false, message: 'Invalid OTP. Please try again.' });
      return;
    }

    // Update user as verified
    const updateUser = await userModel.updateOne(
      { _id: req.session.verifyToken },
      { $set: { isVerified: true } }
    );

    if (!updateUser) {
      res.json({ success: false, message: 'Failed to verify user. Please try again later.' });
      return;
    }

    // Fetch updated user data
    const user = await userModel.findOne({ _id: req.session.verifyToken });
    if (!user) {
      res.json({ success: false, message: 'User not found after verification.' });
      return;
    }

    // Clear the session and respond
    delete req.session.verifyToken;
    res.json({ success: true, message: 'User verification successful. Please log in.', redirect: '/login' });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.json({ success: false, message: errorMessage });
  }
};


export { registerUser, loginUser,verifyOtp};
