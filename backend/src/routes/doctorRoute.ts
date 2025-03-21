import express from "express";
import upload from '../middlewares/multer';
import {
  loginDoctor,
  doctorDashboard,
  doctorProfile,
  doctorList,
  updateDoctorProfile,
  doctorForgotPasswordOTP,
  verifyDoctorOtp,
  resendDoctorOtp,
  doctorResetPassword,
  getSpeciality,
  fileUpload,
} from "../controllers/doctor/doctorController";
import {
  addSlots,
  slot,
  getSlotsByDoctor,
  deleteSlot,
  editSlot,
} from "../controllers/doctor/slotController";
import {
  appoinmentsDoctor,
  appoinmentComplete,
  appoinmentCancel,
} from "../controllers/doctor/appointmentController";
import authDoctor from "../middlewares/authDoctor";
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.post("/verify-otp", verifyDoctorOtp);
doctorRouter.post("/resend-otp", resendDoctorOtp);

doctorRouter.post("/forgotPasswordOTP", doctorForgotPasswordOTP);
doctorRouter.put("/resetPasswordWithToken", doctorResetPassword);
doctorRouter.get("/dashboard",authDoctor,doctorDashboard);
doctorRouter.get("/list", doctorList);
doctorRouter.get("/slot/:docId", slot);

doctorRouter.get("/:doctorId/slots", getSlotsByDoctor);
doctorRouter.post("/slots", addSlots);
doctorRouter.delete("/slots/:slotId", deleteSlot);
doctorRouter.put("/slots/:slotId/edit", editSlot);

doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.get("/specialties", getSpeciality)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
doctorRouter.post('/upload',upload.single('file'),fileUpload)
doctorRouter.get("/appointments", authDoctor, appoinmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appoinmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appoinmentCancel);

export default doctorRouter;
