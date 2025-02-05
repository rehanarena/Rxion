import { Request, Response } from "express";
import bcrypt from "bcrypt";
import OTP from "../models/otpModel";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel";
import { v2 as cloudinary } from "cloudinary";
import { sendOtpEmail } from "../helper/mailer";
import { generateOTP } from "../utils/generateOTP";
import { ObjectId } from "mongodb";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appoinmentModel";
import razorpay from "razorpay";
import IBookedSlot from "../models/doctorModel";

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface Address {
  line1: string;
  line2: string;
}

interface UpdateProfileRequestBody {
  userId: string;
  name: string;
  phone: string;
<<<<<<< HEAD
  address: string;
=======
  address: string; 
>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97
  dob: string;
  gender: string;
}
interface AppointmentData {
  userId: string;
  docId: string;
  userData: Record<string, any>;
  doctData: Record<string, any>;
  amount: number;
  slotTime: string;
  slotDate: string;
  date: number;
}
interface Doctor {
  available: boolean;
  slots_booked?: { [key: string]: string[] };
  fees: number;
  _id: string;
}

interface User {
  _id: string;
}
interface Slot {
  startTime: string;
  isBooked?: boolean;
}

// Define the IBookedSlot interface before usage
export interface IBookedSlot {
  startTime: string;
  isBooked: boolean;
}

interface RazorpayOrderCreateRequestBody {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture?: number;
}

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "49m",
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

const refreshTokens: Map<string, string> = new Map();
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

/// Resend OTP ///
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
      const userId = (user._id as ObjectId).toString();
      const accessToken = generateAccessToken(userId);
      const refreshToken = generateRefreshToken(userId);

      refreshTokens.set(userId, refreshToken);

      res.json({
        success: true,
        accessToken,
        refreshToken,
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/// Google Auth ///
const google = async (req: Request, res: Response): Promise<void> => {
  try {
    // console.log('Request Body:', req.body);
    const { email, name, photo } = req.body;

    if (!name || !email || !photo) {
      res.status(400).json({ message: "Name, email, and photo are required" });
      return;
    }

    let user = await userModel.findOne({ email });

    if (user) {
<<<<<<< HEAD
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "45m",
        }
      );

      const userObject = user.toObject();
      const { password, ...rest } = userObject;
      const expiryDate = new Date(Date.now() + 3600000);
=======
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: "45m",
      });

      const userObject = user.toObject();
      const { password, ...rest } = userObject;
      const expiryDate = new Date(Date.now() + 3600000); 
>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97

      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json({
          success: true,
          message: "Login successful",
          user: rest,
          accessToken: token,
        });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

      const newUser = new userModel({
        username:
          name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8),
        email,
        password: hashedPassword,
        profilePicture: photo,
      });

      // console.log('New User Data:', newUser);

      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "45m",
        }
      );

      const userObject = newUser.toObject();
      const { password: hashedPassword2, ...rest } = userObject;
      res
        .status(201)
        .json({ message: "Account created", user: rest, accessToken: token });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

<<<<<<< HEAD
=======

>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97
/// Refresh Access Token ///
const refreshAccessToken = (req: Request, res: Response): void => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res
      .status(401)
      .json({ success: false, message: "No refresh token provided" });
    return;
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    );

    const storedToken = refreshTokens.get(decoded.id);
    if (storedToken !== refreshToken) {
      res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateAccessToken(decoded.id);
    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
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
      message: "OTP sent to your email. Please verify to reset password.",
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

    const otpData = await OTP.findOne({ userId: user._id, otp });
    if (!otpData) {
      res.json({ success: false, message: "Invalid OTP." });
      return;
    }

    if (otpData.expiresAt < new Date()) {
      res.json({ success: false, message: "OTP has expired." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ userId: user._id });

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

<<<<<<< HEAD
const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
=======

const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message || "An error occurred" });
  }
};

// API to update user profile
const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name, phone, address, dob, gender }: UpdateProfileRequestBody = req.body;
    const imageFile = req.file;
    
    if (!userId || !name || !phone || !address || !dob || !gender) {
       res.json({
        success: false,
        message: "Enter details in all missing fields",
      });
      return
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address) as Address,
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile updated" });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message || "An error occurred" });
  }
};



/// book appoinment ///
const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData || !docData.available) {
       res.json({ success: false, message: "Doctor not available" });
       return
    }



    let slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
         res.json({ success: false, message: "Slot not available" });
         return
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message || "An error occurred" });
  }
};

// API to update user profile
const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      name,
      phone,
      address,
      dob,
      gender,
    }: UpdateProfileRequestBody = req.body;
    const imageFile = req.file;

    if (!userId || !name || !phone || !address || !dob || !gender) {
      res.json({
        success: false,
        message: "Enter details in all missing fields",
      });
      return;
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address) as Address,
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile updated" });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message || "An error occurred" });
  }
};
/// book appoinment ///

const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = (decoded as any).id;

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    if (!docData.available) {
      res.status(400).json({ success: false, message: "Doctor not available" });
      return;
    }

    if (!docData.fees) {
      res.status(400).json({ success: false, message: "Doctor fees not found" });
      return;
    }
    if (!docData.slots_booked) {
      docData.slots_booked = {};
    }
    if (!docData.slots_booked[slotDate]) {
      docData.slots_booked[slotDate] = [];
    }

    const formattedSlotTime = new Date(slotTime).toISOString();

    const isSlotBooked = docData.slots_booked[slotDate].some(
      (slot: any) => slot.startTime === formattedSlotTime && slot.isBooked
    );

    if (isSlotBooked) {
      res.status(400).json({ success: false, message: "Slot not available" });
      return;
    }

    // console.log('Before updating slots_booked:', docData.slots_booked);
    docData.slots_booked[slotDate].push({
      startTime: formattedSlotTime,
      isBooked: true,
    });

    // console.log('After updating slots_booked:', docData.slots_booked);

    await docData.save();  
    const updatedDocData = await doctorModel.findById(docId);
    // console.log('Updated doctor data:', updatedDocData);

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    const appointmentData = new appointmentModel({
      userId,
      docId,
      userData,
      doctData: docData,
      amount: docData.fees,
      slotTime: formattedSlotTime,
      slotDate,
      date: new Date(),
    });

    await appointmentData.save();

    res.status(201).json({ success: true, message: "Appointment booked successfully" });
  } catch (error: any) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: "An error occurred, please try again" });
  }
};




/// appoinments list in my-appointments ///
const listAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    // console.log(req.body)
    // console.log(userId)
    const appointments = await appointmentModel.find({ userId }).lean();

    // console.log(appointments)

    res.json({ success: true, appointments });
  } catch (error: any) {
    console.error("Error:", error);
    res.json({ success: false, message: error.message });
  }
};

///cancel appointment ///

const cancelAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      res.json({ success: false, message: "Appointment not found" });
      return;
    }

    if (appointmentData.userId !== userId) {
      res.json({ success: false, message: "Unauthorized action" });
      return;
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);
    if (!doctorData) {
      res.json({ success: false, message: "Doctor not found" });
      return;
    }

    let slots_booked = doctorData.slots_booked;
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (slot: IBookedSlot) => slot.startTime !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/// payment razorpay ///
const paymentRazorpay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      res.json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
      return;
    }

    ///payment order using razorpay api ///
    const currency = process.env.CURRENCY || "INR";

    const options: RazorpayOrderCreateRequestBody = {
      amount: appointmentData.amount * 100,
      currency: currency,
      receipt: appointmentId.toString(),
      payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/// verify payment ///
const verifyRazorpay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  google,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
