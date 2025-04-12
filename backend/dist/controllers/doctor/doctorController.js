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
exports.DoctorController = void 0;
const specialityModel_1 = __importDefault(require("../../models/specialityModel"));
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
const fs_1 = __importDefault(require("fs"));
const s3Config_1 = __importDefault(require("../../config/s3Config"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class DoctorController {
    constructor(doctorService) {
        this.doctorService = doctorService;
    }
    loginDoctor(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield this.doctorService.loginDoctor(email, password);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    doctorForgotPasswordOTP(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.doctorService.doctorForgotPasswordOTP(email);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyDoctorOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, doctorId } = req.body;
                const result = yield this.doctorService.verifyDoctorOtp(doctorId, otp);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                console.error("Error verifying OTP:", error);
                res
                    .status(statusCode_1.default.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: "Something went wrong." });
            }
        });
    }
    resendDoctorOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId } = req.body;
                const result = yield this.doctorService.resendDoctorOtp(doctorId);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    doctorResetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, token, password } = req.body;
                const result = yield this.doctorService.doctorResetPassword(email, token, password);
                if (!result.success) {
                    res.status(statusCode_1.default.BAD_REQUEST).json(result);
                }
                else {
                    res.status(statusCode_1.default.OK).json(result);
                }
            }
            catch (error) {
                console.error(error);
                res
                    .status(statusCode_1.default.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: "Server error" });
            }
        });
    }
    changeDoctorPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId, currentPassword, newPassword, confirmPassword } = req.body;
                const message = yield this.doctorService.changeDoctorPassword(doctorId, currentPassword, newPassword, confirmPassword);
                res.status(statusCode_1.default.OK).json({ success: true, message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    doctorDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { docId } = req.body;
                if (!docId) {
                    res
                        .status(statusCode_1.default.BAD_REQUEST)
                        .json({ success: false, message: "docId is required" });
                    return;
                }
                const dashData = yield this.doctorService.getDashboardData(docId);
                res.status(statusCode_1.default.OK).json({ success: true, dashData });
            }
            catch (error) {
                console.error(error);
                next(error);
            }
        });
    }
    changeAvailability(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { docId } = req.body;
                const newAvailability = yield this.doctorService.changeAvailability(docId);
                res
                    .status(statusCode_1.default.OK)
                    .json({
                    success: true,
                    message: "Availability Changed",
                    available: newAvailability,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    doctorList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctors = yield this.doctorService.listDoctors();
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
    }
    getSpeciality(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const specialties = yield specialityModel_1.default.find({});
                res.status(statusCode_1.default.OK).json({ success: true, specialties });
            }
            catch (error) {
                res
                    .status(statusCode_1.default.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: "Unable to fetch specialties" });
            }
        });
    }
    doctorProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { docId } = req.body;
                const profileData = yield this.doctorService.getDoctorProfile(docId);
                res.status(statusCode_1.default.OK).json({ success: true, profileData });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateDoctorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { docId, fees, address, available, experience, about } = req.body;
                console.log("Received update:", req.body);
                const updatedDoctor = yield this.doctorService.updateDoctorProfile(docId, { fees, address, available, experience, about });
                res
                    .status(statusCode_1.default.OK)
                    .json({ success: true, message: "Profile Updated", updatedDoctor });
            }
            catch (error) {
                console.error("Error in updateDoctorProfile controller:", error);
                res
                    .status(statusCode_1.default.INTERNAL_SERVER_ERROR)
                    .json({
                    success: false,
                    message: "Server error while updating profile.",
                });
            }
        });
    }
    // async fileUploadofDoc(
    //   req: Request,
    //   res: Response,
    //   next: NextFunction
    // ): Promise<void> {
    //   if (!req.file) {
    //     res.status(HttpStatus.BAD_REQUEST).json({ error: "No file uploaded" });
    //     return;
    //   }
    //   try {
    //     const result = await cloudinary.uploader.upload(req.file.path, {
    //       resource_type: "image",
    //     });
    //     const fileData = {
    //       url: result.secure_url,
    //       type: req.file.mimetype,
    //       fileName: result.original_filename || req.file.originalname,
    //     };
    //     res.status(HttpStatus.OK).json({ file: fileData });
    //   } catch (error) {
    //     console.error("Cloudinary upload error:", error);
    //     res
    //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
    //       .json({ error: "File upload failed." });
    //   }
    // }
    fileUploadofDoc(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                res.status(statusCode_1.default.BAD_REQUEST).json({ error: "No file uploaded" });
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
                // Clean up local file
                fs_1.default.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Error deleting local file:", err);
                    }
                });
                // Get signed URL (valid for 1 hour)
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
                res
                    .status(statusCode_1.default.INTERNAL_SERVER_ERROR)
                    .json({ error: "File upload failed." });
            }
        });
    }
}
exports.DoctorController = DoctorController;
