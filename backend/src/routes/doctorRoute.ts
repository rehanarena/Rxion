import express from "express";
import { loginDoctor, doctorDashboard, doctorList, appoinmentsDoctor, appoinmentComplete, appoinmentCancel } from "../controllers/doctorController";
import authDoctor from "../middlewares/authDoctor";
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/dashboard", doctorDashboard);
doctorRouter.get('/list',doctorList);
doctorRouter.get('/appointments',authDoctor,appoinmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appoinmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appoinmentCancel)

export default doctorRouter;
