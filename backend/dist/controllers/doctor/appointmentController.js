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
exports.appoinmentCancel = exports.appoinmentComplete = exports.appoinmentsDoctor = void 0;
const appointmentService_1 = require("../../services/doctor/appointmentService");
const appointmentRepository_1 = require("../../repositories/doctor/appointmentRepository");
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
const appointmentRepository = new appointmentRepository_1.AppointmentRepository();
const appointmentService = new appointmentService_1.AppointmentService(appointmentRepository);
const appoinmentsDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId } = req.body;
        const appointments = yield appointmentService.getAppointmentsByDoctor(docId);
        res.status(statusCode_1.default.OK).json({ success: true, appointments });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server error while fetching appointments.",
        });
    }
});
exports.appoinmentsDoctor = appoinmentsDoctor;
const appoinmentComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId, appointmentId } = req.body;
        yield appointmentService.completeAppointment(docId, appointmentId);
        res.status(statusCode_1.default.OK).json({ success: true, message: "Appointment Completed" });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Server error while completing appointment.",
        });
    }
});
exports.appoinmentComplete = appoinmentComplete;
const appoinmentCancel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId, appointmentId } = req.body;
        yield appointmentService.cancelAppointment(docId, appointmentId);
        res.status(statusCode_1.default.OK).json({ success: true, message: "Appointment Cancelled" });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Server error while cancelling appointment.",
        });
    }
});
exports.appoinmentCancel = appoinmentCancel;
