"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const DoctorRepository_1 = require("../repositories/doctor/doctorRepository");
const doctorService_1 = require("../services/doctor/DoctorService");
const doctorController_1 = require("../controllers/doctor/doctorController");
const authDoctor_1 = __importDefault(require("../middlewares/authDoctor"));
const doctorOTPRepository_1 = require("../repositories/doctor/doctorOTPRepository");
const slotRepository_1 = require("../repositories/doctor/slotRepository");
const slotService_1 = require("../services/doctor/slotService");
const slotController_1 = require("../controllers/doctor/slotController");
const doctorAppointmentRepository_1 = require("../repositories/doctor/doctorAppointmentRepository");
const appointmentService_1 = require("../services/doctor/appointmentService");
const appointmentController_1 = require("../controllers/doctor/appointmentController");
// Instantiate repositories
const doctorRepository = new DoctorRepository_1.DoctorRepository();
const doctorOTPRepository = new doctorOTPRepository_1.DoctorOTPRepository;
const slotRepository = new slotRepository_1.SlotRepository;
const appointmentRepository = new doctorAppointmentRepository_1.DoctorAppointmentRepository;
// Create the service by injecting the repositories
const doctorService = new doctorService_1.DoctorService(doctorRepository, doctorOTPRepository);
const slotService = new slotService_1.SlotService(slotRepository);
const appointmentService = new appointmentService_1.AppointmentService(appointmentRepository);
// Create the controller by injecting the service
const doctorController = new doctorController_1.DoctorController(doctorService);
const slotController = new slotController_1.SlotController(slotService);
const appointmentController = new appointmentController_1.AppointmentController(appointmentService);
const doctorRouter = express_1.default.Router();
doctorRouter.post("/login", doctorController.loginDoctor.bind(doctorController));
doctorRouter.post("/verify-otp", doctorController.verifyDoctorOtp.bind(doctorController));
doctorRouter.post("/resend-otp", doctorController.resendDoctorOtp.bind(doctorController));
doctorRouter.post("/forgotPasswordOTP", doctorController.doctorForgotPasswordOTP.bind(doctorController));
doctorRouter.put("/resetPasswordWithToken", doctorController.doctorResetPassword.bind(doctorController));
doctorRouter.put("/change-password", doctorController.changeDoctorPassword.bind(doctorController));
doctorRouter.get("/dashboard", authDoctor_1.default, doctorController.doctorDashboard.bind(doctorController));
doctorRouter.get("/list", doctorController.doctorList.bind(doctorController));
doctorRouter.get("/slot/:docId", slotController.slot.bind(slotController));
doctorRouter.get("/:doctorId/slots", slotController.getSlotsByDoctor.bind(slotController));
doctorRouter.post("/slots", slotController.addSlots.bind(slotController));
doctorRouter.delete("/slots/:slotId", slotController.deleteSlot.bind(slotController));
doctorRouter.put("/slots/:slotId/edit", slotController.editSlot.bind(slotController));
doctorRouter.get("/profile", authDoctor_1.default, doctorController.doctorProfile.bind(doctorController));
doctorRouter.get("/specialties", doctorController.getSpeciality.bind(doctorController));
doctorRouter.post("/update-profile", authDoctor_1.default, doctorController.updateDoctorProfile.bind(doctorController));
doctorRouter.post('/upload', multer_1.default.single('file'), doctorController.fileUploadofDoc.bind(doctorController));
doctorRouter.get("/appointments", authDoctor_1.default, appointmentController.appoinmentsDoctor.bind(appointmentController));
doctorRouter.post("/complete-appointment", authDoctor_1.default, appointmentController.appoinmentComplete.bind(appointmentController));
doctorRouter.post("/cancel-appointment", authDoctor_1.default, appointmentController.appoinmentCancel.bind(appointmentController));
exports.default = doctorRouter;
