import express from "express";
<<<<<<< HEAD
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
=======
import { loginDoctor, doctorDashboard, doctorList, appoinmentsDoctor, appoinmentComplete, appoinmentCancel, addSlot, getSlot } from "../controllers/doctorController";
>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97
import authDoctor from "../middlewares/authDoctor";
// import authUser from "../middlewares/authUser";
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/dashboard", doctorDashboard);
<<<<<<< HEAD
doctorRouter.get("/list", doctorList);
doctorRouter.get("/slot/:docId", slot);



doctorRouter.post('/slots',addSlots);
doctorRouter.get("/profile",authDoctor, doctorProfile);
doctorRouter.get("/appointments", authDoctor, appoinmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appoinmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appoinmentCancel);
=======
doctorRouter.get('/list',doctorList);
doctorRouter.post('/:docId/add-slot', addSlot);
doctorRouter.get('/get-slots/:docId', getSlot);
doctorRouter.get('/appointments',authDoctor,appoinmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appoinmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appoinmentCancel)
>>>>>>> bb0eecf5772da206ad1344f54a7bbf5e64d19b97

export default doctorRouter;
