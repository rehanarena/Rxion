import express from "express";
import { loginDoctor, doctorDashboard, doctorList } from "../controllers/doctorController";
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/dashboard", doctorDashboard);
doctorRouter.get('/list',doctorList);

export default doctorRouter;
