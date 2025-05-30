"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authUser_1 = __importDefault(require("../middlewares/authUser"));
const multer_1 = __importDefault(require("../middlewares/multer"));
// Controllers
const authController_1 = require("../controllers/user/authController");
const userController_1 = require("../controllers/user/userController");
// Services
const auth_1 = require("../services/user/auth");
const user_1 = require("../services/user/user");
const AppointmentService_1 = require("../services/user/AppointmentService");
const PaymentService_1 = require("../services/user/PaymentService");
// Repositories
const authRepository_1 = require("../repositories/user/authRepository");
const UserRepository_1 = require("../repositories/user/userRepository");
const OTPRepository_1 = require("../repositories/user/otpRepository");
const TokenRepository_1 = require("../repositories/user/tokenRepository");
const DoctorRepository_1 = require("../repositories/doctor/doctorRepository");
const AppointmentRepository_1 = require("../repositories/user/AppointmentRepository");
const userRouter = express_1.default.Router();
// Instantiate Repositories
const authRepository = new authRepository_1.AuthRepository();
const userRepository = new UserRepository_1.UserRepository();
const otpRepository = new OTPRepository_1.OTPRepository();
const tokenRepository = new TokenRepository_1.TokenRepository();
const doctorRepository = new DoctorRepository_1.DoctorRepository();
const appointmentRepository = new AppointmentRepository_1.AppointmentRepository();
// Instantiate Services
const authService = new auth_1.AuthService(authRepository, otpRepository, tokenRepository);
const userService = new user_1.UserService(userRepository);
const appointmentService = new AppointmentService_1.AppointmentService(doctorRepository, userRepository, appointmentRepository);
const paymentService = new PaymentService_1.PaymentService(appointmentRepository, userRepository);
// Instantiate Controllers
const authController = new authController_1.AuthController(authService);
const userController = new userController_1.UserController(userService, appointmentService, paymentService);
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
userRouter.get("/get-profile", authUser_1.default, userController.getProfile.bind(userController));
userRouter.get("/specialty", userController.getSpecialty.bind(userController));
userRouter.put("/update-profile", multer_1.default.single("image"), authUser_1.default, userController.updateProfile.bind(userController));
userRouter.get("/wallet", authUser_1.default, userController.getWalletBalance.bind(userController));
userRouter.get("/doctors", userController.doctorSearch.bind(userController));
userRouter.post("/upload", multer_1.default.single("image"), userController.fileUploadofuser.bind(userController));
// ----- Appointment Routes -----
userRouter.post("/book-appointment", authUser_1.default, userController.bookAppointment.bind(userController));
userRouter.get("/appointments", authUser_1.default, userController.listAppointments.bind(userController));
userRouter.post("/cancel-appointment", authUser_1.default, userController.cancelAppointment.bind(userController));
// ----- Payment Routes -----
userRouter.post("/payment-razorpay", authUser_1.default, userController.paymentRazorpay.bind(userController));
userRouter.post("/verify-razorpay", authUser_1.default, userController.verifyRazorpay.bind(userController));
exports.default = userRouter;
