import express from "express";
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
doctorRouter.get("/dashboard", doctorDashboard);
doctorRouter.get("/list", doctorList);
doctorRouter.get("/slot/:docId", slot);
doctorRouter.get("/:doctorId/slots", getSlotsByDoctor);
doctorRouter.delete("/slots/:slotId", deleteSlot);
doctorRouter.put("/slots/:slotId/edit", editSlot);

doctorRouter.post("/slots", addSlots);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
doctorRouter.get("/appointments", authDoctor, appoinmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appoinmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appoinmentCancel);

export default doctorRouter;
