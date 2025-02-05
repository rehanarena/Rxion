import express from "express";
import {
  loginDoctor,
  doctorDashboard,
  doctorList,
  appoinmentsDoctor,
  appoinmentComplete,
  appoinmentCancel,
  addSlots,
  // getAvailableSlots,
  slot,
  doctorProfile,
} from "../controllers/doctorController";
import authDoctor from "../middlewares/authDoctor";
// import authUser from "../middlewares/authUser";
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/dashboard", doctorDashboard);
doctorRouter.get("/list", doctorList);
doctorRouter.get("/slot/:docId", slot);



doctorRouter.post('/slots',addSlots);
doctorRouter.get("/profile",authDoctor, doctorProfile);
doctorRouter.get("/appointments", authDoctor, appoinmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appoinmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appoinmentCancel);

export default doctorRouter;
