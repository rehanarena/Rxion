"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUpload = exports.getWalletBalance = exports.verifyRazorpay = exports.paymentRazorpay = exports.cancelAppointment = exports.listAppointments = exports.bookAppointment = exports.doctorSearch = exports.updateProfile = exports.getProfile = exports.changePassword = exports.forgotPassword = exports.refreshAccessToken = exports.google = exports.loginUser = exports.resendOtp = exports.verifyOtp = exports.registerUser = void 0;
const authService_1 = require("../services/user/authService");
const DoctorService_1 = require("../services/doctor/DoctorService");
const AppointmentService_1 = require("../services/user/AppointmentService");
const PaymentService_1 = __importDefault(require("../services/user/PaymentService"));
const UserService_1 = __importDefault(require("../services/user/UserService"));
const mongoose_1 = require("mongoose");
const statusCode_1 = __importDefault(require("../utils/statusCode"));
/// Register User ///
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authService = new authService_1.AuthService();
        const user = yield authService.registerUser(req.body);
        res.status(statusCode_1.default.OK).json({
            success: true,
            userId: user._id,
            message: "OTP sent to email. Please verify.",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
/// Verify OTP ///
const verifyOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, userId } = req.body;
    // Validate userId
    if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
        res.status(statusCode_1.default.BAD_REQUEST).json({ success: false, message: "Invalid userId." });
        return;
    }
    try {
        const authService = new authService_1.AuthService();
        const result = yield authService.verifyOtp(otp, userId);
        res.status(statusCode_1.default.OK).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        next(error);
    }
});
exports.verifyOtp = verifyOtp;
/// Resend OTP ///
const resendOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    // Validate userId
    if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
        res.status(statusCode_1.default.BAD_REQUEST).json({ success: false, message: "Invalid userId." });
        return;
    }
    try {
        const authService = new authService_1.AuthService();
        const result = yield authService.resendOtp(userId);
        res.status(statusCode_1.default.OK).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        next(error);
    }
});
exports.resendOtp = resendOtp;
/// Login User ///
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const authService = new authService_1.AuthService();
        const { accessToken, refreshToken } = yield authService.loginUser(email, password);
        res.status(statusCode_1.default.OK).json({
            success: true,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.loginUser = loginUser;
/// Google Auth ///
const google = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, photo } = req.body;
        if (!name || !email || !photo) {
            res.status(statusCode_1.default.BAD_REQUEST).json({ message: "Name, email, and photo are required" });
            return;
        }
        const authService = new authService_1.AuthService();
        const { status, user, token } = yield authService.googleAuth(email, name, photo);
        // Convert the user document to a plain object and remove the password field.
        const userObject = user.toObject ? user.toObject() : user;
        const { password } = userObject, rest = __rest(userObject, ["password"]);
        if (status === statusCode_1.default.OK) {
            // For an existing user, set an HTTP-only cookie with the token.
            const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry
            res
                .cookie("access_token", token, {
                httpOnly: true,
                expires: expiryDate,
            })
                .status(statusCode_1.default.OK)
                .json({
                success: true,
                message: "Login successful",
                user: rest,
                accessToken: token,
            });
        }
        else {
            // For a newly created account.
            res.status(statusCode_1.default.CREATED).json({
                message: "Account created",
                user: rest,
                accessToken: token,
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.google = google;
/// Refresh Access Token ///
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res
            .status(statusCode_1.default.UNAUTHORIZED)
            .json({ success: false, message: "No refresh token provided" });
        return;
    }
    try {
        const authService = new authService_1.AuthService();
        const newAccessToken = yield authService.refreshAccessToken(refreshToken);
        res.status(statusCode_1.default.OK).json({ success: true, accessToken: newAccessToken });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshAccessToken = refreshAccessToken;
/// Forgot Password Request ///
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const authService = new authService_1.AuthService();
        const result = yield authService.forgotPassword(email);
        res.status(statusCode_1.default.OK).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
/// Change Password ///
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, currentPassword, newPassword, confirmPassword } = req.body;
        const authService = new authService_1.AuthService();
        const message = yield authService.changePassword(userId, currentPassword, newPassword, confirmPassword);
        res.status(statusCode_1.default.OK).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
});
exports.changePassword = changePassword;
/// Get Profile ///
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const authService = new authService_1.AuthService();
        const userData = yield authService.getProfile(userId);
        res.status(statusCode_1.default.OK).json({ success: true, userData });
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
/// Update Profile ///
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, name, phone, address, dob, gender, medicalHistory } = req.body;
        const imageFile = req.file;
        const authService = new authService_1.AuthService();
        const result = yield authService.updateProfile(userId, name, phone, address, dob, gender, imageFile, medicalHistory);
        res.status(statusCode_1.default.OK).json({ success: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
/// Doctor Search ///
const doctorSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { speciality, search, sortBy, page, limit } = req.query;
        const doctorService = new DoctorService_1.DoctorService();
        const result = yield doctorService.searchDoctors({
            speciality: speciality,
            search: search,
            sortBy: sortBy,
            page: page,
            limit: limit,
        });
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.doctorSearch = doctorSearch;
/// Book Appointment ///
const bookAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { docId, slotDate, slotTime } = req.body;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(statusCode_1.default.UNAUTHORIZED).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const appointmentService = new AppointmentService_1.AppointmentService();
        const message = yield appointmentService.bookAppointment(token, docId, slotDate, slotTime);
        res.status(statusCode_1.default.CREATED).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
});
exports.bookAppointment = bookAppointment;
/// List Appointments ///
const listAppointments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const appointmentService = new AppointmentService_1.AppointmentService();
        const appointments = yield appointmentService.listAppointments(userId);
        res.status(statusCode_1.default.OK).json({ success: true, appointments });
    }
    catch (error) {
        next(error);
    }
});
exports.listAppointments = listAppointments;
/// Cancel Appointment ///
const cancelAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, appointmentId } = req.body;
        const appointmentService = new AppointmentService_1.AppointmentService();
        const message = yield appointmentService.cancelAppointment(userId, appointmentId);
        res.status(statusCode_1.default.OK).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
});
exports.cancelAppointment = cancelAppointment;
/// Payment Razorpay ///
const paymentRazorpay = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointmentId } = req.body;
        const result = yield PaymentService_1.default.processPayment(appointmentId);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.paymentRazorpay = paymentRazorpay;
/// Verify Payment ///
const verifyRazorpay = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_payment_id, razorpay_order_id } = req.body;
        const result = yield PaymentService_1.default.verifyPayment(razorpay_payment_id, razorpay_order_id);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.verifyRazorpay = verifyRazorpay;
/// Get Wallet Balance ///
const getWalletBalance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.body.userId;
        if (!userId) {
            res.status(statusCode_1.default.UNAUTHORIZED).json({ success: false, message: "User not authenticated" });
            return;
        }
        const walletBalance = yield UserService_1.default.getWalletBalance(userId);
        res.status(statusCode_1.default.OK).json({ success: true, walletBalance });
    }
    catch (error) {
        next(error);
    }
});
exports.getWalletBalance = getWalletBalance;
const fileUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(statusCode_1.default.BAD_REQUEST).json({ error: 'No file uploaded' });
        return;
    }
    // Construct the file URL. Adjust the URL based on your static file serving setup.
    const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    res.status(statusCode_1.default.OK).json({ url: fileUrl });
});
exports.fileUpload = fileUpload;
