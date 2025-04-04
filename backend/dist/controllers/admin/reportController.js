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
exports.getAppointmentsReport = void 0;
const appoinmentModel_1 = __importDefault(require("../../models/appoinmentModel"));
/**
 * GET /api/reports/appointments?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Returns a report of appointments filtered by a date range.
 */
const getAppointmentsReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        if (startDate && endDate) {
            const startTimestamp = new Date(startDate).getTime();
            const endTimestamp = new Date(endDate).getTime();
            if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid date provided',
                });
                return;
            }
            query.date = { $gte: startTimestamp, $lte: endTimestamp };
        }
        const appointments = yield appoinmentModel_1.default.find(query).sort({ date: -1 });
        const reportData = appointments.map((appt) => {
            return {
                appointmentId: appt._id,
                doctor: (appt.doctData && appt.doctData.name) || "N/A",
                patient: (appt.userData && appt.userData.name) || "N/A",
                date: appt.slotDate,
                time: appt.slotTime,
                paymentStatus: appt.payment ? "Paid" : "Pending",
                fees: appt.amount,
            };
        });
        res.json({
            success: true,
            data: reportData,
        });
    }
    catch (error) {
        console.error("Error fetching appointment report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointment report",
        });
    }
});
exports.getAppointmentsReport = getAppointmentsReport;
