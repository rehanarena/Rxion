import express from "express";
import authUser from "../middlewares/authUser";
import upload from "../middlewares/multer";

// Controllers
import { AuthController } from "../controllers/user/authController";
import { UserController } from "../controllers/user/userController";

// Services
import { AuthService } from "../services/user/auth";
import { UserService } from "../services/user/user";
import { AppointmentService } from "../services/user/AppointmentService";
import { PaymentService } from "../services/user/PaymentService";

// Repositories
import { AuthRepository } from "../repositories/user/authRepository";
import { UserRepository } from "../repositories/user/UserRepository";
import { OTPRepository } from "../repositories/user/OTPRepository";
import { TokenRepository } from "../repositories/user/TokenRepository";
import { DoctorRepository } from "../repositories/doctor/DoctorRepository";
import { AppointmentRepository } from "../repositories/user/AppointmentRepository";

const userRouter = express.Router();


// Instantiate Repositories
const authRepository = new AuthRepository();
const userRepository = new UserRepository();
const otpRepository = new OTPRepository();
const tokenRepository = new TokenRepository();
const doctorRepository = new DoctorRepository();
const appointmentRepository = new AppointmentRepository();

// Instantiate Services
const authService = new AuthService(authRepository, otpRepository, tokenRepository);
const userService = new UserService(userRepository);
const appointmentService = new AppointmentService(doctorRepository, userRepository, appointmentRepository);
const paymentService = new PaymentService(appointmentRepository, userRepository);

// Instantiate Controllers
const authController = new AuthController(authService);
const userController = new UserController(userService, appointmentService, paymentService);

// ----- Auth Routes -----
userRouter.post("/register", authController.registerUser.bind(authController));
userRouter.post("/verify-otp", authController.verifyOtp.bind(authController));
userRouter.post("/resend-otp", authController.resendOtp.bind(authController));
userRouter.post("/login", authController.loginUser.bind(authController));
userRouter.post("/google", authController.google.bind(authController));
userRouter.post("/refresh-token", authController.refreshAccessToken.bind(authController));
userRouter.post("/forgot-password", authController.forgotPassword.bind(authController));
userRouter.put("/reset-password", authController.resetPassword.bind(authController));

// ----- User Routes -----
userRouter.put("/change-password", userController.changePassword.bind(userController));
userRouter.get("/get-profile", authUser, userController.getProfile.bind(userController));
userRouter.get("/specialty", userController.getSpecialty.bind(userController));
userRouter.put(
  "/update-profile",
  upload.single("image"),
  authUser,
  userController.updateProfile.bind(userController)
);
userRouter.get("/wallet", authUser, userController.getWalletBalance.bind(userController));
userRouter.get("/doctors", userController.doctorSearch.bind(userController));
userRouter.post("/upload", upload.single("image"), userController.fileUploadofuser.bind(userController));

// ----- Appointment Routes -----
userRouter.post("/book-appointment", authUser, userController.bookAppointment.bind(userController));
userRouter.get("/appointments", authUser, userController.listAppointments.bind(userController));
userRouter.post("/cancel-appointment", authUser, userController.cancelAppointment.bind(userController));

// ----- Payment Routes -----
userRouter.post("/payment-razorpay", authUser, userController.paymentRazorpay.bind(userController));
userRouter.post("/verify-razorpay", authUser, userController.verifyRazorpay.bind(userController));

export default userRouter;
