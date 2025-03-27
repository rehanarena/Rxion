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
exports.sendAppointmentCancelledEmail = exports.sendAppointmentCompletedEmail = exports.sendPasswordEmail = exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOtpEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP for User Verification',
        text: `Your OTP for account verification is: ${otp}`,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendOtpEmail = sendOtpEmail;
const sendPasswordEmail = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Doctor Account Password',
        text: `Your account has been successfully created. Your password is: ${password}`,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendPasswordEmail = sendPasswordEmail;
const sendAppointmentCompletedEmail = (email, patientName) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank You for Choosing Rxion Team',
        text: `Hello ${patientName},

Thank you for choosing the Rxion team for your consultation. We appreciate your trust in us and look forward to assisting you in the future.

Best regards,
Rxion Team`,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendAppointmentCompletedEmail = sendAppointmentCompletedEmail;
const sendAppointmentCancelledEmail = (email, patientName) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Appointment Cancellation Notice',
        text: `Hello ${patientName},

We regret to inform you that your appointment has been canceled due to unforeseen circumstances on the doctor's end. We sincerely apologize for the inconvenience. Please feel free to reschedule at your convenience.

Best regards,
Rxion Team`,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendAppointmentCancelledEmail = sendAppointmentCancelledEmail;
