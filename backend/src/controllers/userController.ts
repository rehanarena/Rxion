import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "../middlewares/authUser";
import IBookedSlot from "../models/doctorModel";
import { AuthService } from "../services/user/authService";
import { DoctorService } from "../services/doctor/DoctorService";
import { AppointmentService } from "../services/user/AppointmentService";
import PaymentService from "../services/user/PaymentService";
import UserService from "../services/user/UserService";
import { Types } from "mongoose";
import HttpStatus from "../utils/statusCode";
import dotenv from 'dotenv';

dotenv.config();

interface UpdateProfileRequestBody {
  userId: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  medicalHistory: string;
}

export interface IBookedSlot {
  startTime: string;
  isBooked: boolean;
}
interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}
const backendUrl = process.env.NODE_ENV==="PRODUCTION"? process.env.PRODUCTION_URL_BACKEND: process.env.PRODUCTION_DEV_BACKEND


/// Register User ///
const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authService = new AuthService();
    const user = await authService.registerUser(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      userId: user._id,
      message: "OTP sent to email. Please verify.",
    });
  } catch (error: any) {
    next(error);
  }
};

/// Verify OTP ///
const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { otp, userId } = req.body;

  // Validate userId
  if (!userId || !Types.ObjectId.isValid(userId)) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid userId." });
    return;
  }

  try {
    const authService = new AuthService();
    const result = await authService.verifyOtp(otp, userId);
    res.status(HttpStatus.OK).json({ success: true, ...result });
  } catch (error: any) {
    next(error);
  }
};

/// Resend OTP ///
const resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.body;

  // Validate userId
  if (!userId || !Types.ObjectId.isValid(userId)) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid userId." });
    return;
  }

  try {
    const authService = new AuthService();
    const result = await authService.resendOtp(userId);
    res.status(HttpStatus.OK).json({ success: true, ...result });
  } catch (error: any) {
    next(error);
  }
};

/// Login User ///
const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const authService = new AuthService();
    const { accessToken, refreshToken } = await authService.loginUser(email, password);
    res.status(HttpStatus.OK).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    next(error);
  }
};

/// Google Auth ///
const google = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, photo } = req.body;

    if (!name || !email || !photo) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: "Name, email, and photo are required" });
      return;
    }

    const authService = new AuthService();
    const { status, user, token } = await authService.googleAuth(email, name, photo);

    // Convert the user document to a plain object and remove the password field.
    const userObject = user.toObject ? user.toObject() : user;
    const { password, ...rest } = userObject;

    if (status === HttpStatus.OK) {
      // For an existing user, set an HTTP-only cookie with the token.
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(HttpStatus.OK)
        .json({
          success: true,
          message: "Login successful",
          user: rest,
          accessToken: token,
        });
    } else {
      // For a newly created account.
      res.status(HttpStatus.CREATED).json({
        message: "Account created",
        user: rest,
        accessToken: token,
      });
    }
  } catch (error: any) {
    next(error);
  }
};

/// Refresh Access Token ///
const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ success: false, message: "No refresh token provided" });
    return;
  }

  try {
    const authService = new AuthService();
    const newAccessToken = await authService.refreshAccessToken(refreshToken);
    res.status(HttpStatus.OK).json({ success: true, accessToken: newAccessToken });
  } catch (error: any) {
    next(error);
  }
};

/// Forgot Password Request ///
const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const authService = new AuthService();
    const result = await authService.forgotPassword(email);
    res.status(HttpStatus.OK).json({ success: true, ...result });
  } catch (error: any) {
    next(error);
  }
};

/// Change Password ///
const changePassword = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, currentPassword, newPassword, confirmPassword } = req.body;
    const authService = new AuthService();
    const message = await authService.changePassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );
    res.status(HttpStatus.OK).json({ success: true, message });
  } catch (error: any) {
    next(error);
  }
};

/// Get Profile ///
const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body;
    const authService = new AuthService();
    const userData = await authService.getProfile(userId);
    res.status(HttpStatus.OK).json({ success: true, userData });
  } catch (error: any) {
    next(error);
  }
};

/// Update Profile ///
const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, name, phone, address, dob, gender, medicalHistory } =
      req.body as UpdateProfileRequestBody;
    const imageFile = req.file;
    const authService = new AuthService();
    const result = await authService.updateProfile(
      userId,
      name,
      phone,
      address,
      dob,
      gender,
      imageFile,
      medicalHistory 
    );
    res.status(HttpStatus.OK).json({ success: true, message: result.message });
  } catch (error: any) {
    next(error);
  }
};

/// Doctor Search ///
const doctorSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { speciality, search, sortBy, page, limit } = req.query;
    const doctorService = new DoctorService();
    const result = await doctorService.searchDoctors({
      speciality: speciality as string,
      search: search as string,
      sortBy: sortBy as string,
      page: page as string,
      limit: limit as string,
    });
    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

/// Book Appointment ///
const bookAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const appointmentService = new AppointmentService();
    const message = await appointmentService.bookAppointment(token, docId, slotDate, slotTime);
    res.status(HttpStatus.CREATED).json({ success: true, message });
  } catch (error: any) {
    next(error);
  }
};

/// List Appointments ///
const listAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body;
    const appointmentService = new AppointmentService();
    const appointments = await appointmentService.listAppointments(userId);
    res.status(HttpStatus.OK).json({ success: true, appointments });
  } catch (error: any) {
    next(error);
  }
};

/// Cancel Appointment ///
const cancelAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentService = new AppointmentService();
    const message = await appointmentService.cancelAppointment(userId, appointmentId);
    res.status(HttpStatus.OK).json({ success: true, message });
  } catch (error: any) {
    next(error);
  }
};

/// Payment Razorpay ///
const paymentRazorpay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId } = req.body;
    const result = await PaymentService.processPayment(appointmentId);
    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

/// Verify Payment ///
const verifyRazorpay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const result = await PaymentService.verifyPayment(razorpay_payment_id, razorpay_order_id);
    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

/// Get Wallet Balance ///
const getWalletBalance = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: "User not authenticated" });
      return;
    }

    const walletBalance = await UserService.getWalletBalance(userId);
    res.status(HttpStatus.OK).json({ success: true, walletBalance });
  } catch (error: any) {
    next(error);
  }
};

const fileUpload = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: 'No file uploaded' });
    return;
  }
  // Construct the file URL. Adjust the URL based on your static file serving setup.
  const fileUrl = `${backendUrl}/uploads/${req.file.filename}`;
  res.status(HttpStatus.OK).json({ url: fileUrl });
};

export {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  google,
  refreshAccessToken,
  forgotPassword,
  changePassword,
  getProfile,
  updateProfile,
  doctorSearch,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  getWalletBalance,
  fileUpload
};
