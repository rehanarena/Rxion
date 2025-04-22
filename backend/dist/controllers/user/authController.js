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
exports.AuthController = void 0;
const mongoose_1 = require("mongoose");
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    registerUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.authService.registerUser(req.body);
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
    }
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { otp, userId } = req.body;
            if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
                res
                    .status(statusCode_1.default.BAD_REQUEST)
                    .json({ success: false, message: "Invalid userId." });
                return;
            }
            try {
                const result = yield this.authService.verifyOtp(otp, userId);
                res.status(statusCode_1.default.OK).json(Object.assign({ success: true }, result));
            }
            catch (error) {
                next(error);
            }
        });
    }
    resendOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.body;
            if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
                res.status(statusCode_1.default.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid userId.",
                });
                return;
            }
            try {
                const result = yield this.authService.resendOtp(userId);
                res.status(statusCode_1.default.OK).json(Object.assign({ success: true }, result));
            }
            catch (error) {
                next(error);
            }
        });
    }
    loginUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { accessToken, refreshToken } = yield this.authService.loginUser(email, password);
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
    }
    google(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, name, photo } = req.body;
                if (!name || !email || !photo) {
                    res
                        .status(statusCode_1.default.BAD_REQUEST)
                        .json({ message: "Name, email, and photo are required" });
                    return;
                }
                const { status, user, token } = yield this.authService.googleAuth(email, name, photo);
                const userObject = user.toObject ? user.toObject() : user;
                const { password } = userObject, rest = __rest(userObject, ["password"]);
                if (status === statusCode_1.default.OK) {
                    const expiryDate = new Date(Date.now() + 3600000);
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
    }
    refreshAccessToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res
                    .status(statusCode_1.default.UNAUTHORIZED)
                    .json({ success: false, message: "No refresh token provided" });
                return;
            }
            try {
                const newAccessToken = yield this.authService.refreshAccessToken(refreshToken);
                res
                    .status(statusCode_1.default.OK)
                    .json({ success: true, accessToken: newAccessToken });
            }
            catch (error) {
                next(error);
            }
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.authService.forgotPassword(email);
                res.status(statusCode_1.default.OK).json(Object.assign({ success: true }, result));
            }
            catch (error) {
                next(error);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, token, password } = req.body;
                const result = yield this.authService.userResetPassword(email, token, password);
                if (!result.success) {
                    res.status(statusCode_1.default.BAD_REQUEST).json(result);
                }
                else {
                    res.status(statusCode_1.default.OK).json(result);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
