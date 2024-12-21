import express from "express";
import { loginDoctor, doctorDashboard } from "../controllers/doctorController";
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/dashboard", doctorDashboard);

export default doctorRouter;
