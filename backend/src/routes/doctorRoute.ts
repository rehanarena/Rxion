import express from "express";
import upload from '../middlewares/multer';
import { DoctorRepository } from "../repositories/doctor/doctorRepository";
import { DoctorService } from "../services/doctor/doctorService";
import { DoctorController } from "../controllers/doctor/doctorController";
import authDoctor from "../middlewares/authDoctor";
import { DoctorOTPRepository } from "../repositories/doctor/doctorOTPRepository";
import { SlotRepository } from "../repositories/doctor/slotRepository";
import { SlotService } from "../services/doctor/slotService";
import { SlotController } from "../controllers/doctor/slotController";
import { DoctorAppointmentRepository } from "../repositories/doctor/doctorAppointmentRepository";
import { AppointmentService } from "../services/doctor/appointmentService";
import { AppointmentController} from '../controllers/doctor/appointmentController'


// Instantiate repositories
const doctorRepository = new DoctorRepository();
const doctorOTPRepository = new DoctorOTPRepository
const slotRepository = new SlotRepository
const appointmentRepository = new DoctorAppointmentRepository

// Create the service by injecting the repositories
const doctorService = new DoctorService(doctorRepository, doctorOTPRepository)
const slotService = new SlotService(slotRepository)
const appointmentService = new AppointmentService( appointmentRepository,)

// Create the controller by injecting the service
const doctorController = new DoctorController(doctorService);
const slotController = new SlotController(slotService);
const appointmentController = new AppointmentController(appointmentService)


const doctorRouter = express.Router();

doctorRouter.post("/login", doctorController.loginDoctor.bind(doctorController));
doctorRouter.post("/verify-otp", doctorController.verifyDoctorOtp.bind(doctorController));
doctorRouter.post("/resend-otp", doctorController.resendDoctorOtp.bind(doctorController));

doctorRouter.post("/forgotPasswordOTP", doctorController.doctorForgotPasswordOTP.bind(doctorController));
doctorRouter.put("/resetPasswordWithToken", doctorController.doctorResetPassword.bind(doctorController));
doctorRouter.put("/change-password", doctorController.changeDoctorPassword.bind(doctorController));
doctorRouter.get("/dashboard",authDoctor,doctorController.doctorDashboard.bind(doctorController));
doctorRouter.get("/list", doctorController.doctorList.bind(doctorController));
doctorRouter.get("/slot/:docId", slotController.slot.bind(slotController));

doctorRouter.get("/:doctorId/slots", slotController.getSlotsByDoctor.bind(slotController));
doctorRouter.post("/slots", slotController.addSlots.bind(slotController));
doctorRouter.delete("/slots/:slotId", slotController.deleteSlot.bind(slotController));
doctorRouter.put("/slots/:slotId/edit", slotController.editSlot.bind(slotController));

doctorRouter.get("/profile", authDoctor, doctorController.doctorProfile.bind(doctorController));
doctorRouter.get("/specialties", doctorController.getSpeciality.bind(doctorController))
doctorRouter.post("/update-profile", authDoctor, doctorController.updateDoctorProfile.bind(doctorController));
doctorRouter.post('/upload',upload.single('file'),doctorController.fileUploadofDoc.bind(doctorController))
doctorRouter.get("/appointments", authDoctor, appointmentController.appoinmentsDoctor.bind(appointmentController));
doctorRouter.post("/complete-appointment", authDoctor, appointmentController.appoinmentComplete.bind(appointmentController));
doctorRouter.post("/cancel-appointment", authDoctor, appointmentController.appoinmentCancel.bind(appointmentController));

export default doctorRouter;
