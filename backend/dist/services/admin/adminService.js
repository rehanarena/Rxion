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
exports.AdminService = void 0;
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("cloudinary");
const adminRepository_1 = require("../../repositories/admin/adminRepository");
const mailer_1 = require("../../helper/mailer");
class AdminService {
    constructor() {
        this.adminRepository = new adminRepository_1.adminRepository();
    }
    addDoctor(data, imageFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, speciality, degree, experience, about, fees, address, } = data;
            if (!name ||
                !email ||
                !password ||
                !speciality ||
                !degree ||
                !experience ||
                !about ||
                !fees ||
                !address) {
                throw new Error("Missing Details");
            }
            if (!validator_1.default.isEmail(email)) {
                throw new Error("Invalid Email");
            }
            if (password.length < 8) {
                throw new Error("Weak password");
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const imageUpload = yield cloudinary_1.v2.uploader.upload(imageFile.path, {
                resource_type: "image",
            });
            const imageUrl = imageUpload.secure_url;
            let parsedAddress;
            try {
                parsedAddress = JSON.parse(address);
            }
            catch (err) {
                throw new Error("Invalid address format");
            }
            const doctorData = {
                name,
                email,
                image: imageUrl,
                password: hashedPassword,
                speciality,
                degree,
                experience,
                about,
                fees,
                address: parsedAddress,
                date: new Date(),
            };
            yield this.adminRepository.create(doctorData);
            yield (0, mailer_1.sendPasswordEmail)(email, password);
        });
    }
    loginAdmin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield this.adminRepository.validateAdminCredentials(email, password);
            if (!isValid) {
                throw new Error("Invalid Credentials");
            }
            const token = jsonwebtoken_1.default.sign({ email, password }, process.env.JWT_SECRET);
            return { token };
        });
    }
    getDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.getDashboardData();
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.getAllUsers();
        });
    }
    blockUnblockUser(id, action) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.blockUnblockUser(id, action);
        });
    }
    blockUnblockDoctor(id, action) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.blockUnblockDoctor(id, action);
        });
    }
    doctorList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, page = "1", limit = "8", speciality } = params;
            let query = {};
            if (speciality) {
                query.speciality = speciality;
            }
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 8;
            const skip = (pageNum - 1) * limitNum;
            const doctors = yield this.adminRepository.findDoctors(query, skip, limitNum);
            const totalDoctors = yield this.adminRepository.countDoctors(query);
            return {
                totalPages: Math.ceil(totalDoctors / limitNum),
                currentPage: pageNum,
                totalDoctors,
                doctors,
            };
        });
    }
    allDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.getAllDoctors();
        });
    }
    getDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.getDoctorById(doctorId);
        });
    }
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.getAllAppointments();
        });
    }
    cancelAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentData = yield this.adminRepository.findAppointmentById(appointmentId);
            if (!appointmentData) {
                throw new Error("Appointment not found");
            }
            yield this.adminRepository.updateAppointment(appointmentId, {
                cancelled: true,
            });
            const { docId, slotDate, slotTime } = appointmentData;
            const doctorData = yield this.adminRepository.getDoctorById(docId);
            if (!doctorData) {
                throw new Error("Doctor not found");
            }
            let slots_booked = doctorData.slots_booked;
            if (slots_booked && slots_booked[slotDate]) {
                const updatedSlots = slots_booked[slotDate].filter((slot) => `${slot.date} ${slot.time}` !== slotTime);
                slots_booked[slotDate] = updatedSlots;
                yield this.adminRepository.updateDoctorSlots(docId, slots_booked);
            }
            return { message: "Appointment cancelled successfully" };
        });
    }
}
exports.AdminService = AdminService;
