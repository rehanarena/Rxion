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
exports.DoctorService = void 0;
const DoctorRepository_1 = require("../../repositories/doctor/DoctorRepository");
const DoctorOTPRepository_1 = require("../../repositories/doctor/DoctorOTPRepository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const mongodb_1 = require("mongodb");
class DoctorService {
    constructor() {
        this.doctorRepository = new DoctorRepository_1.DoctorRepository();
        this.doctorOTPRepository = new DoctorOTPRepository_1.DoctorOTPRepository();
    }
    searchDoctors(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { speciality, search, sortBy, page = "1", limit = "8" } = params;
            let query = {};
            if (speciality) {
                query.speciality = speciality;
            }
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { speciality: { $regex: search, $options: "i" } },
                ];
            }
            let sortOptions = {};
            if (sortBy === "availability") {
                query.available = true;
            }
            else if (sortBy === "fees") {
                sortOptions.fees = 1;
            }
            else if (sortBy === "experience") {
                sortOptions.experience = -1;
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 8;
            const skip = (pageNum - 1) * limitNum;
            const doctors = yield this.doctorRepository.searchDoctors(query, sortOptions, skip, limitNum);
            const totalDoctors = yield this.doctorRepository.countDoctors(query);
            return {
                totalPages: Math.ceil(totalDoctors / limitNum),
                currentPage: pageNum,
                totalDoctors,
                doctors,
            };
        });
    }
    loginDoctor(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorRepository.findByEmail(email);
            if (!doctor) {
                return { success: false, message: "Invalid credentials" };
            }
            if (doctor.isBlocked) {
                return {
                    success: false,
                    message: "Your account has been blocked by the admin.",
                };
            }
            const isMatch = yield bcryptjs_1.default.compare(password, doctor.password);
            if (isMatch) {
                const token = jsonwebtoken_1.default.sign({ id: doctor._id }, process.env.JWT_SECRET);
                return { success: true, token };
            }
            else {
                return { success: false, message: "Incorrect password" };
            }
        });
    }
    doctorForgotPasswordOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorRepository.findByEmail(email);
            if (!doctor) {
                throw { status: 404, message: "Doctor not found" };
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            console.log("Generated OTP:", otp);
            yield this.doctorOTPRepository.createOtp({
                otp,
                doctorId: doctor._id,
                expiresAt,
            });
            const message = `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`;
            yield this.sendOtpEmail(doctor.email, "Doctor Password Reset OTP", message);
            return {
                success: true,
                message: "OTP sent to your email.",
                doctorId: doctor._id,
            };
        });
    }
    verifyDoctorOtp(doctorId, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doctorId || !mongodb_1.ObjectId.isValid(doctorId)) {
                throw { status: 400, message: "Invalid doctorId." };
            }
            const otpData = yield this.doctorOTPRepository.findOtp({ otp, doctorId });
            if (!otpData) {
                return { success: false, message: "OTP is invalid" };
            }
            if (otpData.expiresAt < new Date()) {
                return { success: false, message: "OTP has expired" };
            }
            const doctor = yield this.doctorRepository.findById(doctorId);
            if (doctor) {
                yield this.doctorOTPRepository.deleteOtp({ otp, doctorId });
                const resetToken = crypto_1.default.randomBytes(20).toString("hex");
                doctor.resetPasswordToken = resetToken;
                doctor.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
                yield this.doctorRepository.saveDoctor(doctor);
                return {
                    success: true,
                    message: "Doctor verified successfully. You can reset your password now.",
                    isForPasswordReset: true,
                    doctorId,
                    email: doctor.email,
                    token: resetToken,
                };
            }
            else {
                return { success: false, message: "Doctor not found" };
            }
        });
    }
    resendDoctorOtp(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doctorId || !mongodb_1.ObjectId.isValid(doctorId)) {
                throw { status: 400, message: "Invalid doctorId." };
            }
            const doctor = yield this.doctorRepository.findById(doctorId);
            if (!doctor) {
                throw { status: 404, message: "Doctor not found." };
            }
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            yield this.doctorOTPRepository.upsertOtp(doctorId, newOtp, expiresAt);
            const emailBody = `
Hello ${doctor.name || "Doctor"},

Your OTP code is: ${newOtp}
This OTP is valid for the next 10 minutes.

If you did not request this, please ignore this email.

Regards,
Rxion Team
    `;
            yield this.sendOtpEmail(doctor.email, "Resend OTP", emailBody);
            return { success: true, message: "OTP has been resent to your email." };
        });
    }
    doctorResetPassword(email, token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorRepository.findOne({
                email,
                resetPasswordToken: token,
                resetPasswordExpire: { $gt: new Date() },
            });
            if (!doctor) {
                return { success: false, message: "Invalid or expired reset token" };
            }
            doctor.password = yield bcryptjs_1.default.hash(password, 10);
            doctor.resetPasswordToken = null;
            doctor.resetPasswordExpire = null;
            yield this.doctorRepository.saveDoctor(doctor);
            return { success: true, message: "Password updated successfully" };
        });
    }
    sendOtpEmail(to, subject, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer_1.default.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            yield transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
            });
        });
    }
    getDashboardData(docId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield this.doctorRepository.getAppointments(docId);
            let earnings = 0;
            const patients = [];
            appointments.forEach((item) => {
                if (item.isCompleted || item.payment) {
                    earnings += item.amount;
                }
                if (!patients.includes(item.userId)) {
                    patients.push(item.userId);
                }
            });
            const dashData = {
                earnings,
                appointments: appointments.length,
                patients: patients.length,
                latestAppointments: [...appointments].reverse().slice(0, 5),
            };
            return dashData;
        });
    }
    changeAvailability(docId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorRepository.findById(docId);
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            const newAvailability = !doctor.available;
            yield this.doctorRepository.updateAvailability(docId, newAvailability);
            return newAvailability;
        });
    }
    listDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doctorRepository.getAllDoctors();
        });
    }
    getDoctorProfile(docId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doctorRepository.getDoctorProfile(docId);
        });
    }
    updateDoctorProfile(docId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!docId) {
                throw new Error("Doctor ID is required");
            }
            const updatedDoctor = yield this.doctorRepository.updateDoctorProfile(docId, data);
            if (!updatedDoctor) {
                throw new Error("Doctor not found");
            }
            return updatedDoctor;
        });
    }
}
exports.DoctorService = DoctorService;
