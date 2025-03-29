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
exports.getTopDoctors = exports.getPaymentStatus = exports.getStatusAppointment = exports.getRevenue = exports.getTotal = void 0;
const appoinmentModel_1 = __importDefault(require("../../models/appoinmentModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const doctorModel_1 = __importDefault(require("../../models/doctorModel"));
const getTotal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Count total appointments
        const totalAppointments = yield appoinmentModel_1.default.countDocuments();
        // console.log(totalAppointments)
        // Sum total earnings
        const earningsResult = yield appoinmentModel_1.default.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const totalEarnings = earningsResult[0] ? earningsResult[0].total : 0;
        // Count unique patients & doctors using distinct
        const totalPatients = yield userModel_1.default.countDocuments();
        console.log(totalPatients);
        const totalDoctors = yield doctorModel_1.default.countDocuments();
        console.log(totalDoctors);
        res.json({ totalAppointments, totalEarnings, totalPatients, totalDoctors });
    }
    catch (error) {
        next(error);
    }
});
exports.getTotal = getTotal;
const getRevenue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { period } = req.query;
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
        // Default to daily if no valid period is provided
        groupId = {
            year: { $year: { $toDate: "$date" } },
            month: { $month: { $toDate: "$date" } },
            day: { $dayOfMonth: { $toDate: "$date" } },
        };
    }
    try {
        const revenueData = yield appoinmentModel_1.default.aggregate([
            {
                $group: {
                    _id: groupId,
                    totalRevenue: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json(revenueData);
    }
    catch (error) {
        next(error);
    }
});
exports.getRevenue = getRevenue;
const getStatusAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
        res.json(statusData);
    }
    catch (error) {
        next(error);
    }
});
exports.getStatusAppointment = getStatusAppointment;
const getPaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
        res.json(paymentData);
    }
    catch (error) {
        next(error);
    }
});
exports.getPaymentStatus = getPaymentStatus;
const getTopDoctors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topDoctors = yield appoinmentModel_1.default.aggregate([
            // Convert docId (string) to ObjectId so that it matches doctorModel._id
            {
                $addFields: {
                    doctorObjectId: { $toObjectId: "$docId" },
                },
            },
            // Group appointments by the converted doctor ID
            {
                $group: {
                    _id: "$doctorObjectId",
                    totalAppointments: { $sum: 1 },
                    totalEarnings: { $sum: "$amount" },
                },
            },
            // Join with the doctors collection to fetch doctor details
            {
                $lookup: {
                    from: "doctors", // This should match the actual MongoDB collection name (usually pluralized)
                    localField: "_id",
                    foreignField: "_id",
                    as: "doctorInfo",
                },
            },
            // Unwind the joined array to access doctor fields directly
            {
                $unwind: "$doctorInfo",
            },
            // Project only the fields you need
            {
                $project: {
                    _id: 0,
                    docId: "$_id",
                    name: "$doctorInfo.name",
                    totalAppointments: 1,
                    totalEarnings: 1,
                },
            },
            // Sort by total appointments (or totalEarnings) in descending order
            { $sort: { totalAppointments: -1 } },
            // Limit to the top doctor (or top N doctors if you remove/adjust the limit)
            { $limit: 1 },
        ]);
        console.log(topDoctors);
        res.json(topDoctors);
    }
    catch (error) {
        next(error);
    }
});
exports.getTopDoctors = getTopDoctors;
