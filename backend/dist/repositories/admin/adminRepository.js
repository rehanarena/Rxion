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
    // Repository method
    // async getAdminDashboardData(): Promise<
    //   any
    // > {
    //   try {
    //     // Calculate total counts
    //     // const [doctors, patients, totalAppointments] = await Promise.all([
    //     //   doctorModel.countDocuments({}),
    //     //   userModel.countDocuments({}),
    //     //   appointmentModel.countDocuments({ cancelled: { $ne: true } })
    //     // ]);
    //     // Calculate total earnings (only for non-cancelled, paid appointments)
    //     // const earningsAgg = await appointmentModel.aggregate([
    //     //   {
    //     //     $match: {
    //     //       cancelled: { $ne: true },
    //     //       payment: true
    //     //     }
    //     //   },
    //     //   {
    //     //     $group: {
    //     //       _id: null,
    //     //       totalEarnings: { $sum: "$amount" }
    //     //     }
    //     //   }
    //     // ]);
    //     // console.log(earningsAgg)
    //     // const totalEarnings = earningsAgg[0]?.totalEarnings || 0;
    //     // Monthly earnings for the last 7 months
    //     // const monthlyEarningsAgg = await appointmentModel.aggregate([
    //     //   {
    //     //     $match: {
    //     //       cancelled: { $ne: true },
    //     //       payment: true
    //     //     }
    //     //   },
    //     //   {
    //     //     $group: {
    //     //       _id: {
    //     //         $dateToString: { 
    //     //           format: "%Y-%m", 
    //     //           date: "$createdAt" 
    //     //         }
    //     //       },
    //     //       monthEarnings: { $sum: "$amount" }
    //     //     }
    //     //   },
    //     //   { $sort: { _id: 1 } },
    //     //   { $limit: 7 }
    //     // ]);
    //     // Prepare monthly earnings data with padding
    //     // let monthlyEarnings = monthlyEarningsAgg.map(item => item.monthEarnings);
    //     // while (monthlyEarnings.length < 7) {
    //     //   monthlyEarnings.unshift(0);
    //     // }
    //     // Appointment trend for the last 7 days (non-cancelled)
    //     // const today = new Date();
    //     // const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    //     // const appointmentTrendAgg = await appointmentModel.aggregate([
    //     //   {
    //     //     $match: {
    //     //       createdAt: { 
    //     //         $gte: sevenDaysAgo, 
    //     //         $lte: today 
    //     //       },
    //     //       cancelled: { $ne: true }
    //     //     }
    //     //   },
    //     //   {
    //     //     $group: {
    //     //       _id: { $dateToString: { format: "%m-%d", date: "$createdAt" } },
    //     //       count: { $sum: 1 }
    //     //     }
    //     //   },
    //     //   { $sort: { _id: 1 } }
    //     // ]);
    //     // const appointmentTrend = {
    //     //   labels: appointmentTrendAgg.map(item => item._id),
    //     //   data: appointmentTrendAgg.map(item => item.count)
    //     // };
    //     // return {
    //     //   doctors,
    //     //   patients,
    //     //   appointments: totalAppointments,
    //     //   earnings: totalEarnings,
    //     //   monthlyEarnings,
    //     //   appointmentChartData: appointmentTrend,
    //     //   success: "rena"
    //     // };
    //     return true;
    //   } catch (error) {
    //     console.error("Error fetching dashboard data:", error);
    //     throw new Error("Failed to fetch dashboard data");
    //   }
    // }
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
