import express from "express";
import { addDoctor,loginAdmin } from  "../controllers/adminController";
import upload from "../middlewares/multer";
import authAdmin from "../middlewares/authAdmin";

const adminRouter = express.Router();
adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor",authAdmin,upload.single('image'), addDoctor);

export default adminRouter;
