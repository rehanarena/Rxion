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
exports.AuthService = void 0;
const UserRepository_1 = require("../../repositories/user/UserRepository");
const OTPRepository_1 = require("../../repositories/user/OTPRepository");
const TokenRepository_1 = require("../../repositories/user/TokenRepository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const generateOTP_1 = require("../../utils/generateOTP");
const mailer_1 = require("../../helper/mailer");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("cloudinary");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    constructor() {
        this.userRepository = new UserRepository_1.UserRepository();
        this.otpRepository = new OTPRepository_1.OTPRepository();
        this.tokenRepository = new TokenRepository_1.TokenRepository();
    }
    registerUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, confirmPassword } = data;
            if (!name || !email || !password) {
                throw new Error("Enter details in all fields");
            }
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            if (typeof password !== "string") {
                throw new Error("Password must be a string");
            }
            if (!validator_1.default.isEmail(email)) {
                throw new Error("Enter a valid email");
            }
            if (password.length < 8) {
                throw new Error("Enter a strong password");
            }
            const existingUser = yield this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new Error("Email already registered");
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const user = yield this.userRepository.createUser({
                name,
                email,
                password: hashedPassword,
            });
            const otp = (0, generateOTP_1.generateOTP)(6);
            console.log(otp);
            yield (0, mailer_1.sendOtpEmail)(email, otp);
            yield this.otpRepository.createOTP(user._id, otp, new Date(Date.now() + 10 * 60 * 1000));
            return user;
        });
    }
    verifyOtp(otp, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpData = yield this.otpRepository.findOtp(otp, userId);
            if (!otpData) {
                throw new Error("OTP is invalid");
            }
            if (otpData.expiresAt < new Date()) {
                throw new Error("OTP has expired");
            }
            const user = yield this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            // Mark user as verified
            user.isVerified = true;
            yield this.userRepository.updateUser(user);
            // Delete the used OTP
            yield this.otpRepository.deleteOtp(otp);
            // Generate reset token
            const resetToken = crypto_1.default.randomBytes(20).toString("hex");
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
            yield this.userRepository.saveUser(user);
            return {
                userId,
                isForPasswordReset: true,
                message: "User verified successfully. You can reset your password now.",
                email: user.email, // Return the user's email
                token: resetToken, // Return the generated reset token
            };
        });
    }
    resendOtp(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found.");
            }
            const newOtp = (0, generateOTP_1.generateOTP)(6);
            console.log(`resend ${newOtp}`);
            yield this.otpRepository.updateOtp(userId, newOtp, new Date(Date.now() + 10 * 60 * 1000));
            const emailBody = `
      Hello ${user.name || "User"},
      
      Your OTP code is: ${newOtp}
      This OTP is valid for the next 10 minutes.
      
      If you did not request this, please ignore this email.
      
      Regards,
      Rxion Team
    `;
            yield (0, mailer_1.sendOtpEmail)(user.email, emailBody);
            return { message: "OTP has been resent to your email." };
        });
    }
    generateAccessToken(userId, expiresIn = "3d") {
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn,
        });
    }
    generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error("User does not exist");
            }
            if (user.isBlocked) {
                throw new Error("Your account has been blocked.");
            }
            if (!user.isVerified) {
                throw new Error("Please verify your email first.");
            }
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                throw new Error("Invalid credentials");
            }
            const userId = String(user._id);
            const accessToken = this.generateAccessToken(userId);
            const refreshToken = this.generateRefreshToken(userId);
            this.tokenRepository.setToken(userId, refreshToken);
            return { accessToken, refreshToken };
        });
    }
    googleAuth(email, name, photo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name || !email || !photo) {
                throw new Error("Name, email, and photo are required");
            }
            let user = yield this.userRepository.findByEmail(email);
            if (user) {
                const token = this.generateAccessToken(String(user._id), "3d");
                return { status: 200, user, token };
            }
            else {
                const generatedPassword = Math.random().toString(36).slice(-8) +
                    Math.random().toString(36).slice(-8);
                const hashedPassword = bcryptjs_1.default.hashSync(generatedPassword, 10);
                const username = name.split(" ").join("").toLowerCase() +
                    Math.random().toString(36).slice(-8);
                const newUser = yield this.userRepository.createUser({
                    name: username,
                    email,
                    password: hashedPassword,
                    profilePicture: photo,
                });
                const token = this.generateAccessToken(String(newUser._id), "45m");
                return { status: 201, user: newUser, token };
            }
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw new Error("No refresh token provided");
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
                const storedToken = this.tokenRepository.getToken(decoded.id);
                if (storedToken !== refreshToken) {
                    throw new Error("Invalid refresh token");
                }
                const newAccessToken = this.generateAccessToken(decoded.id);
                return newAccessToken;
            }
            catch (error) {
                console.error(error);
                throw new Error("Invalid or expired refresh token");
            }
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }
            const otp = (0, generateOTP_1.generateOTP)(6);
            yield this.otpRepository.createOTP(String(user._id), otp, new Date(Date.now() + 10 * 60 * 1000));
            const emailBody = `
      Hello ${user.name || "User"},
  
      Your OTP code for resetting your password is: ${otp}
      This OTP is valid for the next 10 minutes.
  
      If you did not request this, please ignore this email.
  
      Regards,
      Rxion Team
    `;
            yield (0, mailer_1.sendOtpEmail)(email, emailBody);
            return {
                message: "OTP sent to your email. Please verify to reset password.",
                userId: String(user._id) // Include the userId here
            };
        });
    }
    userResetPassword(email, token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({
                email,
                resetPasswordToken: token,
                resetPasswordExpire: { $gt: new Date() },
            });
            if (!user) {
                return { success: false, message: "Invalid or expired reset token" };
            }
            user.password = yield bcryptjs_1.default.hash(password, 10);
            user.resetPasswordToken = null;
            user.resetPasswordExpire = null;
            yield this.userRepository.saveUser(user);
            return { success: true, message: "Password updated successfully" };
        });
    }
    changePassword(userId, currentPassword, newPassword, confirmPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new Error("User ID is required.");
            }
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new Error("All fields are required.");
            }
            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }
            const user = yield this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found.");
            }
            const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new Error("Current password is incorrect.");
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            user.password = yield bcryptjs_1.default.hash(newPassword, salt);
            yield this.userRepository.updateUser(user);
            return "Password changed successfully.";
        });
    }
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = yield this.userRepository.findByIdWithoutPassword(userId);
            if (!userData) {
                throw new Error("User not found");
            }
            return userData;
        });
    }
    updateProfile(userId, name, phone, address, dob, gender, imageFile, medicalHistory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !name || !phone || !address || !dob || !gender) {
                throw new Error("Enter details in all missing fields");
            }
            const parsedAddress = JSON.parse(address);
            // Build the update data object including medicalHistory if provided
            const updateData = {
                name,
                phone,
                address: parsedAddress,
                dob,
                gender,
            };
            if (medicalHistory) {
                updateData.medicalHistory = medicalHistory;
            }
            // Update the user profile with the new data
            yield this.userRepository.updateProfile(userId, updateData);
            if (imageFile) {
                const imageUpload = yield cloudinary_1.v2.uploader.upload(imageFile.path, {
                    resource_type: "image",
                });
                const imageURL = imageUpload.secure_url;
                yield this.userRepository.updateProfile(userId, { image: imageURL });
            }
            return { message: "Profile updated" };
        });
    }
}
exports.AuthService = AuthService;
