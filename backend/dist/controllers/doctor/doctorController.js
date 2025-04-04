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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadofDoc = exports.doctorList = exports.changeAvailability = exports.doctorDashboard = exports.loginDoctor = exports.updateDoctorProfile = exports.doctorProfile = exports.getSpeciality = exports.changeDoctorPassword = exports.doctorResetPassword = exports.resendDoctorOtp = exports.verifyDoctorOtp = exports.doctorForgotPasswordOTP = void 0;
const DoctorService_1 = require("../../services/doctor/DoctorService");
const specialityModel_1 = __importDefault(require("../../models/specialityModel"));
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const doctorService = new DoctorService_1.DoctorService();
const backendUrl = process.env.NODE_ENV === "PRODUCTION" ? process.env.PRODUCTION_URL_BACKEND : process.env.PRODUCTION_DEV_BACKEND;
const loginDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield doctorService.loginDoctor(email, password);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.loginDoctor = loginDoctor;
const doctorForgotPasswordOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const result = yield doctorService.doctorForgotPasswordOTP(email);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        console.error(error);
        const status = error.status || statusCode_1.default.INTERNAL_SERVER_ERROR;
        res.status(status).json({ success: false, message: error.message || "Server error" });
    }
});
exports.doctorForgotPasswordOTP = doctorForgotPasswordOTP;
const verifyDoctorOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, doctorId } = req.body;
        const result = yield doctorService.verifyDoctorOtp(doctorId, otp);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong." });
    }
});
exports.verifyDoctorOtp = verifyDoctorOtp;
const resendDoctorOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.body;
        const result = yield doctorService.resendDoctorOtp(doctorId);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        const status = error.status || statusCode_1.default.INTERNAL_SERVER_ERROR;
        res.status(status).json({
            success: false,
            message: error.message || "An error occurred while resending the OTP. Please try again later."
        });
    }
});
exports.resendDoctorOtp = resendDoctorOtp;
const doctorResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, token, password } = req.body;
        const result = yield doctorService.doctorResetPassword(email, token, password);
        if (!result.success) {
            res.status(statusCode_1.default.BAD_REQUEST).json(result);
        }
        else {
            res.status(statusCode_1.default.OK).json(result);
        }
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
});
exports.doctorResetPassword = doctorResetPassword;
const changeDoctorPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, currentPassword, newPassword, confirmPassword } = req.body;
        const message = yield doctorService.changeDoctorPassword(doctorId, currentPassword, newPassword, confirmPassword);
        res.status(statusCode_1.default.OK).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
});
exports.changeDoctorPassword = changeDoctorPassword;
const doctorDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId } = req.body;
        if (!docId) {
            res.status(statusCode_1.default.BAD_REQUEST).json({ success: false, message: "docId is required" });
            return;
        }
        const dashData = yield doctorService.getDashboardData(docId);
        res.status(statusCode_1.default.OK).json({ success: true, dashData });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.doctorDashboard = doctorDashboard;
const changeAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId } = req.body;
        const newAvailability = yield doctorService.changeAvailability(docId);
        res.status(statusCode_1.default.OK).json({ success: true, message: "Availability Changed", available: newAvailability });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Doctor not found") {
            res.status(statusCode_1.default.NOT_FOUND).json({ success: false, message: error.message });
        }
        else {
            res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error while changing availability." });
        }
    }
});
exports.changeAvailability = changeAvailability;
const doctorList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield doctorService.listDoctors();
        res.status(statusCode_1.default.OK).json({ success: true, doctors });
    }
    catch (error) {
        console.log(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server error while fetching doctors.",
        });
    }
});
exports.doctorList = doctorList;
const getSpeciality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const specialties = yield specialityModel_1.default.find({});
        res.status(statusCode_1.default.OK).json({ success: true, specialties });
    }
    catch (error) {
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: "Unable to fetch specialties" });
    }
});
exports.getSpeciality = getSpeciality;
const doctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId } = req.body;
        const profileData = yield doctorService.getDoctorProfile(docId);
        res.status(statusCode_1.default.OK).json({ success: true, profileData });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.doctorProfile = doctorProfile;
const updateDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId, fees, address, available, experience, about } = req.body;
        console.log("Received update:", req.body); // Debug log
        const updatedDoctor = yield doctorService.updateDoctorProfile(docId, { fees, address, available, experience, about });
        res.status(statusCode_1.default.OK).json({ success: true, message: "Profile Updated", updatedDoctor });
    }
    catch (error) {
        console.error("Error in updateDoctorProfile controller:", error);
        // Error handling...
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error while updating profile." });
    }
});
exports.updateDoctorProfile = updateDoctorProfile;
const fileUploadofDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(statusCode_1.default.BAD_REQUEST).json({ error: 'No file uploaded' });
        return;
    }
    try {
        const result = yield cloudinary_1.v2.uploader.upload(req.file.path, {
            resource_type: "image",
        });
        // const imageUrl = result.secure_url;
        // const fileData = {
        //   url: imageUrl,
        //   type: image.mimetype,
        //   fileName: image.originalname,
        // };
        const fileData = {
            url: result.secure_url,
            type: req.file.mimetype,
            fileName: result.original_filename || req.file.originalname,
        };
        res.status(statusCode_1.default.OK).json({ file: fileData });
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ error: "File upload failed." });
    }
});
exports.fileUploadofDoc = fileUploadofDoc;
