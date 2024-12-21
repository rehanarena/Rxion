import express from "express";
import { addDoctor,loginAdmin, adminDashboard } from  "../controllers/adminController";
import upload from "../middlewares/multer";
import authAdmin from "../middlewares/authAdmin";

const adminRouter = express.Router();
adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor",authAdmin,upload.single('image'), addDoctor);
adminRouter.get("/dashboard",authAdmin,adminDashboard)

export default adminRouter;
