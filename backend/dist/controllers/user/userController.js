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
exports.UserController = void 0;
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
const dotenv_1 = __importDefault(require("dotenv"));
const specialityModel_1 = __importDefault(require("../../models/specialityModel"));
const fs_1 = __importDefault(require("fs"));
const s3Config_1 = __importDefault(require("../../config/s3Config"));
dotenv_1.default.config();
class UserController {
    constructor(userService, appointmentService, paymentService) {
        this.userService = userService;
        this.appointmentService = appointmentService;
        this.paymentService = paymentService;
    }
    /// Change Password ///
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, currentPassword, newPassword, confirmPassword } = req.body;
                const message = yield this.userService.changePassword(userId, currentPassword, newPassword, confirmPassword);
                res.status(statusCode_1.default.OK).json({ success: true, message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    /// Get Profile ///
    getProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.body;
                const userData = yield this.userService.getProfile(userId);
                res.status(statusCode_1.default.OK).json({ success: true, userData });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    /// Update Profile ///
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, name, phone, address, dob, gender, medicalHistory } = req.body;
                const imageFile = req.file;
                const result = yield this.userService.updateProfile(userId, name, phone, address, dob, gender, imageFile, medicalHistory);
                res.status(statusCode_1.default.OK).json({ success: true, message: result.message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    getSpecialty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const specialties = yield specialityModel_1.default.find({});
                res.status(200).json({ specialties });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    /// Get Wallet Balance ///
    getWalletBalance(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.body.userId;
                if (!userId) {
                    res.status(statusCode_1.default.UNAUTHORIZED).json({ success: false, message: "User not authenticated" });
                    return;
                }
                const walletBalance = yield this.userService.getWalletBalance(userId);
                res.status(statusCode_1.default.OK).json({ success: true, walletBalance });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    /// Doctor Search ///
    doctorSearch(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { speciality, search, sortBy, page, limit } = req.query;
                const result = yield this.userService.searchDoctors({
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
    }
    ;
    /// Book Appointment ///
    bookAppointment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { docId, slotDate, slotTime } = req.body;
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                if (!token) {
                    res.status(statusCode_1.default.UNAUTHORIZED).json({ success: false, message: "Unauthorized access" });
                    return;
                }
                const message = yield this.appointmentService.bookAppointment(token, docId, slotDate, slotTime);
                res.status(statusCode_1.default.CREATED).json({ success: true, message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /// List Appointments ///
    listAppointments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.body;
                const appointments = yield this.appointmentService.listAppointments(userId);
                res.status(statusCode_1.default.OK).json({ success: true, appointments });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /// Cancel Appointment ///
    cancelAppointment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, appointmentId } = req.body;
                const message = yield this.appointmentService.cancelAppointment(userId, appointmentId);
                res.status(statusCode_1.default.OK).json({ success: true, message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /// Payment Razorpay ///
    paymentRazorpay(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId } = req.body;
                const result = yield this.paymentService.processPayment(appointmentId);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    /// Verify Payment ///
    verifyRazorpay(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { razorpay_payment_id, razorpay_order_id } = req.body;
                const result = yield this.paymentService.verifyPayment(razorpay_payment_id, razorpay_order_id);
                if (result.message === "Already paid") {
                    res.status(409).json(result);
                }
                else {
                    res.status(200).json(result);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    fileUploadofuser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                res
                    .status(statusCode_1.default.BAD_REQUEST)
                    .json({ error: "No file uploaded" });
                return;
            }
            try {
                const fileContent = fs_1.default.readFileSync(req.file.path);
                const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: uniqueFileName,
                    Body: fileContent,
                    ContentType: req.file.mimetype,
                };
                const data = yield s3Config_1.default.upload(params).promise();
                fs_1.default.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Error deleting local file:", err);
                    }
                });
                const signedUrl = s3Config_1.default.getSignedUrl("getObject", {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: uniqueFileName,
                    Expires: 60 * 60,
                });
                const fileData = {
                    url: signedUrl,
                    type: req.file.mimetype,
                    fileName: req.file.originalname,
                };
                res.status(statusCode_1.default.OK).json({ file: fileData });
            }
            catch (error) {
                console.error("Error uploading file:", error);
                next(error);
            }
        });
    }
}
exports.UserController = UserController;
