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
exports.AdminRepository = void 0;
const doctorModel_1 = __importDefault(require("../../models/doctorModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const appoinmentModel_1 = __importDefault(require("../../models/appoinmentModel"));
class AdminRepository {
    create(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newDoctor = new doctorModel_1.default(doctorData);
            return newDoctor.save();
        });
    }
    validateAdminCredentials(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return (email === process.env.ADMIN_EMAIL &&
                password === process.env.ADMIN_PASSWORD);
        });
    }
    getUsers(search, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = search
                ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                    ],
                }
                : {};
            const skip = (page - 1) * limit;
            const users = yield userModel_1.default.find(query).skip(skip).limit(limit);
            const total = yield userModel_1.default.countDocuments(query);
            return { users, total };
        });
    }
    blockUnblockUser(id, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(id);
            if (!user) {
                throw new Error("User not found");
            }
            if (action === "block") {
                user.isBlocked = true;
            }
            else if (action === "unblock") {
                user.isBlocked = false;
            }
            else {
                throw new Error("Invalid action");
            }
            yield user.save();
            return { message: `User has been ${action}ed successfully.` };
        });
    }
    blockUnblockDoctor(id, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield doctorModel_1.default.findById(id);
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            if (action === "block") {
                doctor.isBlocked = true;
            }
            else if (action === "unblock") {
                doctor.isBlocked = false;
            }
            else {
                throw new Error("Invalid action");
            }
            yield doctor.save();
            return { message: `Doctor has been ${action}ed successfully.` };
        });
    }
    findDoctors(query, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.find(query).skip(skip).limit(limit);
        });
    }
    countDoctors(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.countDocuments(query);
        });
    }
    getAllDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.find({}).select("-password");
        });
    }
    getDoctorById(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.findById(doctorId);
        });
    }
    getAllAppointments(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, sortField, sortOrder, page, limit } = options;
            const query = {};
            if (search) {
                query["userData.name"] = { $regex: search, $options: "i" };
            }
            const sortOptions = {};
            sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
            const skip = (page - 1) * limit;
            const appointments = yield appoinmentModel_1.default
                .find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);
            return appointments;
        });
    }
    findAppointmentById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return appoinmentModel_1.default.findById(appointmentId);
        });
    }
    updateAppointment(appointmentId, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return appoinmentModel_1.default.findByIdAndUpdate(appointmentId, update, {
                new: true,
            });
        });
    }
    updateDoctorSlots(docId, slots_booked) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.findByIdAndUpdate(docId, { slots_booked }, { new: true });
        });
    }
}
exports.AdminRepository = AdminRepository;
