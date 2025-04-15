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
exports.DashboardRepository = void 0;
const appoinmentModel_1 = __importDefault(require("../../models/appoinmentModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const doctorModel_1 = __importDefault(require("../../models/doctorModel"));
class DashboardRepository {
    getTotalReports() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAppointments = yield appoinmentModel_1.default.countDocuments();
            const earningsResult = yield appoinmentModel_1.default.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]);
            const totalEarnings = earningsResult[0] ? earningsResult[0].total : 0;
            const totalPatients = yield userModel_1.default.countDocuments();
            const totalDoctors = yield doctorModel_1.default.countDocuments();
            return { totalAppointments, totalEarnings, totalPatients, totalDoctors };
        });
    }
    getRevenueReports(period) {
        return __awaiter(this, void 0, void 0, function* () {
            let groupId;
            if (period === "daily") {
                groupId = {
                    year: { $year: { $toDate: "$date" } },
                    month: { $month: { $toDate: "$date" } },
                    day: { $dayOfMonth: { $toDate: "$date" } },
                };
            }
            else if (period === "weekly") {
                groupId = {
                    year: { $year: { $toDate: "$date" } },
                    week: { $week: { $toDate: "$date" } },
                };
            }
            else if (period === "monthly") {
                groupId = {
                    year: { $year: { $toDate: "$date" } },
                    month: { $month: { $toDate: "$date" } },
                };
            }
            else if (period === "yearly") {
                groupId = { year: { $year: { $toDate: "$date" } } };
            }
            else {
                groupId = {
                    year: { $year: { $toDate: "$date" } },
                    month: { $month: { $toDate: "$date" } },
                    day: { $dayOfMonth: { $toDate: "$date" } },
                };
            }
            const revenueData = yield appoinmentModel_1.default.aggregate([
                {
                    $group: {
                        _id: groupId,
                        totalRevenue: { $sum: "$amount" },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            return revenueData;
        });
    }
    getStatusAppointmentReports() {
        return __awaiter(this, void 0, void 0, function* () {
            const statusData = yield appoinmentModel_1.default.aggregate([
                {
                    $group: {
                        _id: {
                            status: {
                                $cond: [
                                    { $eq: ["$cancelled", true] },
                                    "Cancelled",
                                    {
                                        $cond: [
                                            { $eq: ["$isCompleted", true] },
                                            "Completed",
                                            "Pending",
                                        ],
                                    },
                                ],
                            },
                        },
                        count: { $sum: 1 },
                    },
                },
            ]);
            return statusData;
        });
    }
    getPaymentStatusReports() {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentData = yield appoinmentModel_1.default.aggregate([
                {
                    $group: {
                        _id: {
                            payment: { $cond: [{ $eq: ["$payment", true] }, "Paid", "Unpaid"] },
                        },
                        count: { $sum: 1 },
                    },
                },
            ]);
            return paymentData;
        });
    }
    getTopDoctorReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const topDoctors = yield appoinmentModel_1.default.aggregate([
                {
                    $addFields: {
                        doctorObjectId: { $toObjectId: "$docId" },
                    },
                },
                {
                    $group: {
                        _id: "$doctorObjectId",
                        totalAppointments: { $sum: 1 },
                        totalEarnings: { $sum: "$amount" },
                    },
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "_id",
                        foreignField: "_id",
                        as: "doctorInfo",
                    },
                },
                { $unwind: "$doctorInfo" },
                {
                    $project: {
                        _id: 0,
                        docId: "$_id",
                        name: "$doctorInfo.name",
                        totalAppointments: 1,
                        totalEarnings: 1,
                    },
                },
                { $sort: { totalAppointments: -1 } },
                { $limit: 1 },
            ]);
            return topDoctors;
        });
    }
    getAppointmentsReport(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {};
            if (startDate && endDate) {
                const startTimestamp = new Date(startDate).getTime();
                const endTimestamp = new Date(endDate).getTime();
                if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
                    throw new Error("Invalid date provided");
                }
                query.date = { $gte: startTimestamp, $lte: endTimestamp };
            }
            const appointments = yield appoinmentModel_1.default.find(query).sort({ date: -1 });
            const reportData = appointments.map((appt) => ({
                appointmentId: appt._id,
                doctor: (appt.doctData && appt.doctData.name) || "N/A",
                patient: (appt.userData && appt.userData.name) || "N/A",
                date: appt.slotDate,
                time: appt.slotTime,
                paymentStatus: appt.payment ? "Paid" : "Pending",
                fees: appt.amount,
            }));
            return reportData;
        });
    }
}
exports.DashboardRepository = DashboardRepository;
