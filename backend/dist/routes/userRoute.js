"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authUser_1 = __importDefault(require("../middlewares/authUser"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const userRouter = express_1.default.Router();
userRouter.post('/register', userController_1.registerUser);
userRouter.post("/verify-otp", userController_1.verifyOtp);
userRouter.post("/resend-otp", userController_1.resendOtp);
userRouter.post("/login", userController_1.loginUser);
userRouter.post('/google', userController_1.google);
userRouter.post("/refresh-token", userController_1.refreshAccessToken);
userRouter.post('/forgot-password', userController_1.forgotPassword);
userRouter.put('/change-password', userController_1.changePassword);
userRouter.get('/get-profile', authUser_1.default, userController_1.getProfile);
userRouter.put('/update-profile', multer_1.default.single("image"), authUser_1.default, userController_1.updateProfile);
userRouter.get('/doctors', userController_1.doctorSearch);
userRouter.post('/book-appointment', authUser_1.default, userController_1.bookAppointment);
userRouter.get('/appointments', authUser_1.default, userController_1.listAppointments);
userRouter.post('/upload', multer_1.default.single('file'), userController_1.fileUpload);
userRouter.post('/cancel-appointment', authUser_1.default, userController_1.cancelAppointment);
userRouter.post('/payment-razorpay', authUser_1.default, userController_1.paymentRazorpay);
userRouter.post('/verify-razorpay', authUser_1.default, userController_1.verifyRazorpay);
userRouter.get('/wallet', authUser_1.default, userController_1.getWalletBalance);
exports.default = userRouter;
