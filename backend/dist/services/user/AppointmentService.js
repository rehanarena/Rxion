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
exports.AppointmentService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mailer_1 = require("../../helper/mailer");
class AppointmentService {
    constructor(doctorRepository, userRepository, appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }
    bookAppointment(token, docId, slotDate, slotTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            const docData = yield this.doctorRepository.findById(docId);
            if (!docData)
                throw new Error("Doctor not found");
            if (!docData.available)
                throw new Error("Doctor not available");
            if (!docData.fees)
                throw new Error("Doctor fees not found");
            // Ensure slots_booked is an object
            if (!docData.slots_booked || Array.isArray(docData.slots_booked)) {
                docData.slots_booked = {};
            }
            if (!docData.slots_booked[slotDate]) {
                docData.slots_booked[slotDate] = [];
            }
            const formattedSlotTime = new Date(slotTime).toISOString();
            const slotDatePart = formattedSlotTime.split("T")[0];
            const slotTimePart = new Date(formattedSlotTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
            const isSlotBooked = docData.slots_booked[slotDate].some((slot) => slot.date === slotDatePart && slot.time === slotTimePart);
            if (isSlotBooked) {
                throw new Error("Slot not available");
            }
            // Add new slot
            docData.slots_booked[slotDate].push({
                date: slotDatePart,
                time: slotTimePart,
            });
            docData.markModified("slots_booked");
            yield this.doctorRepository.updateDoctor(String(docData._id), {
                slots_booked: docData.slots_booked,
            });
            const userData = yield this.userRepository.findById(userId);
            if (!userData)
                throw new Error("User not found");
            // Generate a custom unique appointment ID //
            const appointmentId = `APTMNT${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 10)}`;
            const appointmentData = {
                appointmentId,
                userId,
                docId,
                userData,
                doctData: docData,
                amount: docData.fees,
                slotTime: formattedSlotTime,
                slotDate,
                date: new Date(),
            };
            const appointment = yield this.appointmentRepository.createAppointment(appointmentData);
            console.log("Saved appointment:", appointment);
            try {
                yield (0, mailer_1.sendAppointmentBookedEmail)(userData.email, userData.name, slotDatePart, slotTimePart);
            }
            catch (error) {
                console.error("Failed to send confirmation email:", error);
            }
            return `Appointment booked successfully. Appointment ID: ${appointmentId}`;
        });
    }
    listAppointments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.appointmentRepository.findAppointmentsByUserId(userId);
        });
    }
    cancelAppointment(userId, appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentData = yield this.appointmentRepository.findById(appointmentId);
            if (!appointmentData) {
                throw new Error("Appointment not found");
            }
            if (appointmentData.userId.toString() !== userId) {
                throw new Error("Unauthorized action");
            }
            yield this.appointmentRepository.updateAppointment(appointmentId, {
                cancelled: true,
            });
            if (appointmentData.payment) {
                yield this.userRepository.updateUser(userId, {
                    $inc: { walletBalance: appointmentData.amount },
                });
            }
            const { docId, slotDate, slotTime } = appointmentData;
            const doctorData = yield this.doctorRepository.findById(docId);
            if (!doctorData) {
                throw new Error("Doctor not found");
            }
            let slots_booked = doctorData.slots_booked;
            const formattedSlotTime = new Date(slotTime).toISOString();
            const slotTimePart = new Date(formattedSlotTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter((slot) => slot.time !== slotTimePart);
            }
            yield this.doctorRepository.updateDoctor(docId, { slots_booked });
            return "Appointment cancelled and amount refunded to wallet";
        });
    }
}
exports.AppointmentService = AppointmentService;
