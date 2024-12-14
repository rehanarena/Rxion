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
exports.sendOtpEmail = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const otpModel_1 = __importDefault(require("../models/otpModel"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOtpEmail = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ _id, email }, res) {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    console.log("otp: ", otp);
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.BREVO_MAIL,
            pass: process.env.BREVO_KEY,
        },
    });
    const mailOptions = {
        from: process.env.BREVO_MAIL,
        to: email,
        subject: "For email verification from Ministore",
        html: `<p>Your OTP for verification is ${otp}. Don't share your OTP!<br>The OTP is only valid for 5 minutes.</p>`,
    };
    const hashedOtp = yield bcrypt_1.default.hash(otp, 10);
    const existingOtpData = yield otpModel_1.default.findOne({ userId: _id });
    if (existingOtpData) {
        const deletedOldOtpData = yield otpModel_1.default.deleteOne({ userId: _id });
        // Handle deletion failure if necessary
        if (!deletedOldOtpData) {
            // You can send an error response here if needed
            console.log("Failed to delete the old OTP data.");
            return false;
        }
    }
    const otpdata = new otpModel_1.default({
        userId: _id,
        otp: hashedOtp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
    });
    yield otpdata.save();
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email has been sent", info.response);
        return true;
    }
    catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
});
exports.sendOtpEmail = sendOtpEmail;
