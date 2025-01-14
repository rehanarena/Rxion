import express from "express";
import { addDoctor,loginAdmin, adminDashboard, userList, blockUnblockUser, doctorList, allDoctors, blockUnblockDoctor, appointmentsAdmin, cancelAppointment } from  "../controllers/adminController";
import upload from "../middlewares/multer";
import authAdmin from "../middlewares/authAdmin";
import { changeAvailability } from "../controllers/doctorController";

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor",authAdmin,upload.single('image'), addDoctor);
adminRouter.get("/dashboard",authAdmin,adminDashboard)
adminRouter.get("/users", userList)
adminRouter.patch("/users/block-unblock/:id", blockUnblockUser);
adminRouter.patch("/doctors/block-unblock/:id", blockUnblockDoctor);
adminRouter.get("/doctors", doctorList);
adminRouter.post("/all-doctors",authAdmin,allDoctors);
adminRouter.post("/change-availability",authAdmin,changeAvailability);
adminRouter.get("/appointments",authAdmin,appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointment);
export default adminRouter;
