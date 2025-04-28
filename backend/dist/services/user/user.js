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
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = require("cloudinary");
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
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
            var _a;
            if (!userId || !name || !phone || !address || !dob || !gender) {
                throw new Error("Enter details in all missing fields");
            }
            const parsedAddress = JSON.parse(address);
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
            const currentUser = yield this.userRepository.findById(userId);
            if (!currentUser) {
                throw new Error("User not found");
            }
            if (imageFile && currentUser.image) {
                const previousImagePublicId = (_a = currentUser.image
                    .split("/")
                    .pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
                if (previousImagePublicId) {
                    const deleteResponse = yield cloudinary_1.v2.uploader.destroy(previousImagePublicId);
                    console.log("Old image delete response:", deleteResponse);
                    if (deleteResponse.result === "ok") {
                        console.log("Old image deleted successfully.");
                    }
                    else {
                        console.log("Failed to delete the old image.");
                    }
                }
            }
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
    getWalletBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.getWalletBalance(userId);
        });
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
            const doctors = yield this.userRepository.searchDoctors(query, sortOptions, skip, limitNum);
            const totalDoctors = yield this.userRepository.countDoctors(query);
            return {
                totalPages: Math.ceil(totalDoctors / limitNum),
                currentPage: pageNum,
                totalDoctors,
                doctors,
            };
        });
    }
}
exports.UserService = UserService;
