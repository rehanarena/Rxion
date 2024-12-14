import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import OTP from '../models/otpModel';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import userModel from '../models/userModel';
import { sendOtpEmail } from '../helper/mailer';
import { generateOTP } from '../utils/generateOTP';
import { ObjectId } from "mongodb";

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}
// **Register User**

const registerUser = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      res.json({ success: false, message: 'Enter details in all fields' });
      return;
    }

    if (typeof password !== 'string') {
      res.json({ success: false, message: 'Password must be a string' });
      return;
    }
    if (!validator.isEmail(email)) {
      res.json({ success: false, message: 'Enter a valid email' });
      return;
    }
    if (password.length < 8) {
      res.json({ success: false, message: 'Enter a strong password' });
      return;
    }

    // Check if email is already registered
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.json({ success: false, message: 'Email already registered' });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      expiresIn: '1d',
    });

    // Generate OTP and send to email
    const otp = generateOTP(6);
    console.log(otp);
    
    await sendOtpEmail(email, otp);

    // Save OTP to the database
    const otpData = new OTP({
      userId: user._id,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
    });
    await otpData.save();

    // Send response with userId and token
    res.json({
      success: true,
      token,
      userId: user._id,
      message: 'OTP sent to email. Please verify.',
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




// **Verify OTP**
const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { otp, userId } = req.body;

  if (!userId || !ObjectId.isValid(userId)) {
    res.status(400).json({ success: false, message: 'Invalid userId.' });
    return;
  }

  try {
    // Find OTP data from the database
    const otpData = await OTP.findOne({ otp, userId });

    if (!otpData) {
      res.json({ success: false, message: 'OTP is invalid' });
      return;
    }

    // Check if OTP is expired
    if (otpData.expiresAt < new Date()) {
      res.json({ success: false, message: 'OTP has expired' });
      return;
    }

    // Find the user and mark them as verified
    const user = await userModel.findById(userId);
    if (user) {
      user.isVerified = true; // Mark user as verified
      await user.save();
      await OTP.deleteOne({ otp }); // Delete OTP after successful verification

      res.json({
        success: true,
        message: 'User verified successfully. You can log in now.',
      });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};



// **Login User**
const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: 'User does not exist' });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.json({ success: false, message: 'Please verify your email first.' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1d',
      });
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


export { registerUser, loginUser, verifyOtp };
