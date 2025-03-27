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
exports.adminRepository = void 0;
// repositories/adminRepository.ts
const doctorModel_1 = __importDefault(require("../../models/doctorModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const appoinmentModel_1 = __importDefault(require("../../models/appoinmentModel"));
class adminRepository {
    create(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newDoctor = new doctorModel_1.default(doctorData);
            return newDoctor.save();
        });
    }
    validateAdminCredentials(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Compare credentials against environment variables
            return (email === process.env.ADMIN_EMAIL &&
                password === process.env.ADMIN_PASSWORD);
        });
    }
    getDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            // Basic counts
            const doctors = yield doctorModel_1.default.find({});
            const patients = yield userModel_1.default.find({});
            const latestAppointments = yield appoinmentModel_1.default
                .find({})
                .sort({ createdAt: -1 })
                .limit(5);
            // Calculate "today" and "7 days ahead"
            const today = new Date();
            const sevenDaysAhead = new Date();
            sevenDaysAhead.setDate(today.getDate() + 7);
            // Aggregate appointments that are scheduled between today and 7 days ahead
            // converting slotTime (a string) to a Date using $dateFromString
            const appointmentAggregation = yield appoinmentModel_1.default.aggregate([
                {
                    $addFields: {
                        convertedSlotTime: {
                            $dateFromString: {
                                dateString: "$slotTime"
                            }
                        }
                    }
                },
                {
                    $match: {
                        convertedSlotTime: { $gte: today, $lte: sevenDaysAhead },
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%m-%d", date: "$convertedSlotTime" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            console.log("Today is:", today);
            console.log("Seven days ahead:", sevenDaysAhead);
            console.log("Aggregation result:", appointmentAggregation);
            // Build labels & data arrays for the chart
            const labels = appointmentAggregation.map((item) => item._id);
            const data = appointmentAggregation.map((item) => item.count);
            return {
                doctors: doctors.length,
                patients: patients.length,
                latestAppointments,
                appointmentChartData: { labels, data },
            };
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return userModel_1.default.find();
        });
    }
    // Method for blocking/unblocking a user
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
    // Method for blocking/unblocking a doctor
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
    // New: Get doctors list with pagination & search
    findDoctors(query, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.find(query).skip(skip).limit(limit);
        });
    }
    // New: Count the number of doctors matching a query
    countDoctors(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.countDocuments(query);
        });
    }
    // New: Get all doctors excluding the password field
    getAllDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.find({}).select("-password");
        });
    }
    // New: Get a single doctor by ID
    getDoctorById(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.findById(doctorId);
        });
    }
    // New: Appointment-related methods
    // Get all appointments
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            return appoinmentModel_1.default.find({});
        });
    }
    // Find an appointment by its ID
    findAppointmentById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return appoinmentModel_1.default.findById(appointmentId);
        });
    }
    // Update an appointment with the given update object
    updateAppointment(appointmentId, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return appoinmentModel_1.default.findByIdAndUpdate(appointmentId, update, { new: true });
        });
    }
    // Update a doctor's booked slots (used during cancellation)
    updateDoctorSlots(docId, slots_booked) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.default.findByIdAndUpdate(docId, { slots_booked }, { new: true });
        });
    }
}
exports.adminRepository = adminRepository;
