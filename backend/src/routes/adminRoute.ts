import express from "express";
import { addDoctor,loginAdmin,  userList, blockUnblockUser, doctorList, allDoctors, blockUnblockDoctor, appointmentsAdmin, cancelAppointment, getDoctors } from  "../controllers/adminController";
import upload from "../middlewares/multer";
import authAdmin from "../middlewares/authAdmin";
import { changeAvailability } from "../controllers/doctor/doctorController";
import { addSpecialty, deleteSpecialty, editSpecialty, getSpecialties } from "../controllers/admin/specialityController";
import { getAppointmentsReport } from "../controllers/admin/reportController";
import { getPaymentStatus, getRevenue, getStatusAppointment, getTopDoctors, getTotal } from "../controllers/admin/dashboardController";

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor",authAdmin,upload.single('image'), addDoctor);
adminRouter.get("/specialties",getSpecialties);
adminRouter.post ("/add-specialties",addSpecialty);
adminRouter.delete("/delete-specialties/:specialtyId" ,deleteSpecialty)
adminRouter.put("/edit-specialties/:specialtyId", editSpecialty);
// adminRouter.get("/dashboard",authAdmin,adminDashboard);
// adminRouter.get("/dashboard",authAdmin, getAdminDashboardData);
adminRouter.get("/users",authAdmin, userList);
adminRouter.patch("/users/block-unblock/:id",authAdmin, blockUnblockUser);
adminRouter.patch("/doctors/block-unblock/:id",authAdmin, blockUnblockDoctor);
adminRouter.get("/doctors",authAdmin, doctorList);
adminRouter.post("/all-doctors",authAdmin,allDoctors);
adminRouter.get("/doctor/:doctorId",authAdmin,getDoctors);
adminRouter.post("/change-availability",authAdmin,changeAvailability);
adminRouter.get("/appointments",authAdmin,appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointment);
adminRouter.get("/reports",getAppointmentsReport)




adminRouter.get("/metrics",getTotal);
adminRouter.get("/revenue",getRevenue);
adminRouter.get("/appointments-status",getStatusAppointment)
adminRouter.get("/appointments-payment",getPaymentStatus)
adminRouter.get("/top-doctors",getTopDoctors)

export default adminRouter;
