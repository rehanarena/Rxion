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
exports.DoctorOTPRepository = void 0;
const docOtpModel_1 = __importDefault(require("../../models/docOtpModel"));
class DoctorOTPRepository {
    createOtp(otpData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield docOtpModel_1.default.create(otpData);
        });
    }
    findOtp(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield docOtpModel_1.default.findOne(query);
        });
    }
    deleteOtp(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield docOtpModel_1.default.deleteOne(query);
        });
    }
    upsertOtp(doctorId, otp, expiresAt) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield docOtpModel_1.default.findOneAndUpdate({ doctorId }, { otp, expiresAt }, { upsert: true, new: true });
        });
    }
}
exports.DoctorOTPRepository = DoctorOTPRepository;
