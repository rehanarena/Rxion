import express from "express";
import { addDoctor,loginAdmin, adminDashboard, userList, blockUnblockUser, doctorList } from  "../controllers/adminController";
import upload from "../middlewares/multer";
import authAdmin from "../middlewares/authAdmin";

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor",authAdmin,upload.single('image'), addDoctor);
adminRouter.get("/dashboard",authAdmin,adminDashboard)
adminRouter.get("/users", userList)
adminRouter.patch("/users/block-unblock/:id", blockUnblockUser);
adminRouter.get("/doctors", doctorList);

export default adminRouter;
