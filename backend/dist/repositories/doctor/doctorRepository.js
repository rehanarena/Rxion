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
exports.DoctorRepository = void 0;
const doctorModel_1 = __importDefault(require("../../models/doctorModel"));
const appoinmentModel_1 = __importDefault(require("../../models/appoinmentModel"));
class DoctorRepository {
    findById(docId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findById(docId);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findOne({ email });
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findOne(query);
        });
    }
    updateDoctor(docId, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findByIdAndUpdate(docId, update, { new: true });
        });
    }
    saveDoctor(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doc.save();
        });
    }
    getAppointments(docId) {
        return __awaiter(this, void 0, void 0, function* () {
            return appoinmentModel_1.default.find({ docId });
        });
    }
    updateAvailability(docId, available) {
        return __awaiter(this, void 0, void 0, function* () {
            yield doctorModel_1.default.findByIdAndUpdate(docId, { available });
        });
    }
    getAllDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.find({}).select(["-password", "-email"]);
        });
    }
    getDoctorProfile(docId) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.findById(docId).select("-password");
        });
    }
    updateDoctorProfile(docId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.findByIdAndUpdate(docId, { $set: updateData }, { new: true });
        });
    }
    updatingDoctor(doctor) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctor.save();
        });
    }
}
exports.DoctorRepository = DoctorRepository;
