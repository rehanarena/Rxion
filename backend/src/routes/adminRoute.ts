import express from "express";
import upload from "../middlewares/multer";
import authAdmin from "../middlewares/authAdmin";


import { AdminController } from "../controllers/admin/adminController"
import { AdminService } from "../services/admin/adminService"
import { AdminRepository } from "../repositories/admin/adminRepository"; 


import { DoctorController } from "../controllers/doctor/doctorController"
import { DoctorService } from "../services/doctor/doctorService";
import { DoctorRepository } from "../repositories/doctor/DoctorRepository";
import { DoctorOTPRepository } from "../repositories/doctor/doctorOTPRepository";

import { ReportController } from "../controllers/admin/reportController"

import { DashboardController } from "../controllers/admin/dashboardController";
import { DashboardRepository } from "../repositories/admin/dashboardRepository";


import { SpecialityRepository } from "../repositories/admin/specialityRepository";
import { SpecialityService } from "../services/admin/specialityService";
import { SpecialityController } from "../controllers/admin/specialityController";


// Instantiate repositories
const adminRepository = new AdminRepository();
const doctorRepository = new DoctorRepository();
const doctorOTPRepository = new DoctorOTPRepository();
const dashboardRepository = new DashboardRepository();
const specialityRepository = new SpecialityRepository()

// Create the service by injecting the repositories
const adminService = new AdminService(adminRepository)
const doctorService = new DoctorService(doctorRepository, doctorOTPRepository);
const specialityService = new SpecialityService(specialityRepository);



// Create the controller by injecting the service
const adminController = new AdminController(adminService);
const doctorController = new DoctorController(doctorService,)
const reportController = new ReportController(dashboardRepository)
const dashboardController = new DashboardController(dashboardRepository)
const specialityController = new SpecialityController(specialityService);




const adminRouter = express.Router();

adminRouter.post("/login", adminController.loginAdmin.bind(adminController))
adminRouter.get("/metrics",authAdmin,dashboardController.getTotal.bind(dashboardController));
adminRouter.get("/revenue",authAdmin,dashboardController.getRevenue.bind(dashboardController));
adminRouter.get("/appointments-status",authAdmin,dashboardController.getStatusAppointment.bind(dashboardController))
adminRouter.get("/appointments-payment",authAdmin,dashboardController.getPaymentStatus.bind(dashboardController))
adminRouter.get("/top-doctors",authAdmin,dashboardController.getTopDoctors.bind(dashboardController))
adminRouter.post("/add-doctor",authAdmin,upload.single('image'), adminController.addDoctor.bind(adminController));
adminRouter.get("/specialties",specialityController.getSpecialties.bind(specialityController));
adminRouter.post ("/add-specialties",specialityController.addSpecialty.bind(specialityController));
adminRouter.delete("/delete-specialties/:specialtyId" ,specialityController.deleteSpecialty.bind(specialityController));
adminRouter.put("/edit-specialties/:specialtyId", specialityController.editSpecialty.bind(specialityController));
adminRouter.get("/users",authAdmin, adminController.userList.bind(adminController));
adminRouter.patch("/users/block-unblock/:id",authAdmin, adminController.blockUnblockUser.bind(adminController));
adminRouter.patch("/doctors/block-unblock/:id",authAdmin, adminController.blockUnblockDoctor.bind(adminController));
adminRouter.get("/doctors",authAdmin, adminController.doctorList.bind(adminController));
adminRouter.post("/all-doctors",authAdmin,adminController.allDoctors.bind(adminController));
adminRouter.get("/doctor/:doctorId",authAdmin,adminController.getDoctors.bind(adminController));
adminRouter.post("/change-availability",authAdmin,doctorController.changeAvailability.bind(doctorController));
adminRouter.get("/appointments",authAdmin,adminController.appointmentsAdmin.bind(adminController));
adminRouter.post("/cancel-appointment", authAdmin, adminController.cancelAppointment.bind(adminController));
adminRouter.get("/reports",authAdmin,reportController.getAppointmentsReport.bind(reportController));






export default adminRouter;
