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
exports.verifyOtp = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const otpModel_1 = __importDefault(require("../models/otpModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validator_1 = __importDefault(require("validator"));
const userModel_1 = __importDefault(require("../models/userModel"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validate fields
        if (!name || !email || !password) {
            res.json({
                success: false,
                message: "Enter details in all fields",
            });
            return;
        }
        if (typeof password !== "string") {
            res.json({ success: false, message: "Password must be a string" });
            return;
        }
        if (!validator_1.default.isEmail(email)) {
            res.json({ success: false, message: "Enter a valid email" });
            return;
        }
        if (password.length < 8) {
            res.json({ success: false, message: "Enter a strong password" });
            return;
        }
        // Hash the password
        const salt = yield bcrypt_1.default.genSalt(10); // Generates salt correctly
        if (!salt) {
            throw new Error("Failed to generate salt");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, salt); // Hash password with valid salt
        // Save user data
        const userData = {
            name,
            email,
            password: hashedPassword,
        };
        const newUser = new userModel_1.default(userData);
        const user = yield newUser.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.json({ success: true, token });
    }
    catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
});
exports.registerUser = registerUser;
// API for user login
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if the user exists
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            res.json({ success: false, message: "User does not exist" });
            return;
        }
        // Compare passwords
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (isMatch) {
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    }
    catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.json({ success: false, message: errorMessage });
    }
});
exports.loginUser = loginUser;
//verifyOtp
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { val1, val2, val3, val4, val5, val6 } = req.body;
        const otp = val1 + val2 + val3 + val4 + val5 + val6; // Concatenate OTP values
        if (!req.session.verifyToken) {
            res.json({ success: false, message: 'Session timeout. Please log in again.' });
            return;
        }
        // Fetch OTP verification data
        const otpVerifyData = yield otpModel_1.default.findOne({ userId: req.session.verifyToken });
        if (!otpVerifyData) {
            res.json({ success: false, message: 'OTP expired. Please try logging in again.' });
            return;
        }
        // Compare the OTP
        const isOtpValid = yield bcrypt_1.default.compare(otp, otpVerifyData.otp);
        if (!isOtpValid) {
            res.json({ success: false, message: 'Invalid OTP. Please try again.' });
            return;
        }
        // Update user as verified
        const updateUser = yield userModel_1.default.updateOne({ _id: req.session.verifyToken }, { $set: { isVerified: true } });
        if (!updateUser) {
            res.json({ success: false, message: 'Failed to verify user. Please try again later.' });
            return;
        }
        // Fetch updated user data
        const user = yield userModel_1.default.findOne({ _id: req.session.verifyToken });
        if (!user) {
            res.json({ success: false, message: 'User not found after verification.' });
            return;
        }
        // Clear the session and respond
        delete req.session.verifyToken;
        res.json({ success: true, message: 'User verification successful. Please log in.', redirect: '/login' });
    }
    catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.json({ success: false, message: errorMessage });
    }
});
exports.verifyOtp = verifyOtp;
