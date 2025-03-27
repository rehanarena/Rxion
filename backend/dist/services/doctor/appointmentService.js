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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const mailer_1 = require("../../helper/mailer");
class AppointmentService {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }
    getAppointmentsByDoctor(docId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.appointmentRepository.getAppointmentsByDoctor(docId);
        });
    }
    completeAppointment(docId, appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentData = yield this.appointmentRepository.getAppointmentById(appointmentId);
            if (appointmentData && appointmentData.docId === docId) {
                yield this.appointmentRepository.updateAppointment(appointmentId, {
                    isCompleted: true,
                });
                if (appointmentData.userData) {
                    const userData = appointmentData.userData;
                    if (userData.email && userData.name) {
                        yield (0, mailer_1.sendAppointmentCompletedEmail)(userData.email, userData.name);
                    }
                }
            }
            else {
                throw new Error("Mark Failed");
            }
        });
    }
    cancelAppointment(docId, appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentData = yield this.appointmentRepository.getAppointmentById(appointmentId);
            if (appointmentData && appointmentData.docId === docId) {
                yield this.appointmentRepository.updateAppointment(appointmentId, {
                    cancelled: true,
                });
                if (appointmentData.userData) {
                    const userData = appointmentData.userData;
                    if (userData.email && userData.name) {
                        yield (0, mailer_1.sendAppointmentCancelledEmail)(userData.email, userData.name);
                    }
                }
            }
            else {
                throw new Error("Cancellation Failed");
            }
        });
    }
}
exports.AppointmentService = AppointmentService;
