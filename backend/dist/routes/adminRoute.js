"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const multer_1 = __importDefault(require("../middlewares/multer"));
const authAdmin_1 = __importDefault(require("../middlewares/authAdmin"));
const doctorController_1 = require("../controllers/doctor/doctorController");
const specialityController_1 = require("../controllers/admin/specialityController");
const reportController_1 = require("../controllers/admin/reportController");
const dashboardController_1 = require("../controllers/admin/dashboardController");
const adminRouter = express_1.default.Router();
adminRouter.post("/login", adminController_1.loginAdmin);
adminRouter.get("/metrics", authAdmin_1.default, dashboardController_1.getTotal);
adminRouter.get("/revenue", authAdmin_1.default, dashboardController_1.getRevenue);
adminRouter.get("/appointments-status", authAdmin_1.default, dashboardController_1.getStatusAppointment);
adminRouter.get("/appointments-payment", authAdmin_1.default, dashboardController_1.getPaymentStatus);
adminRouter.get("/top-doctors", authAdmin_1.default, dashboardController_1.getTopDoctors);
adminRouter.post("/add-doctor", authAdmin_1.default, multer_1.default.single('image'), adminController_1.addDoctor);
adminRouter.get("/specialties", specialityController_1.getSpecialties);
adminRouter.post("/add-specialties", specialityController_1.addSpecialty);
adminRouter.delete("/delete-specialties/:specialtyId", specialityController_1.deleteSpecialty);
adminRouter.put("/edit-specialties/:specialtyId", specialityController_1.editSpecialty);
adminRouter.get("/users", authAdmin_1.default, adminController_1.userList);
adminRouter.patch("/users/block-unblock/:id", authAdmin_1.default, adminController_1.blockUnblockUser);
adminRouter.patch("/doctors/block-unblock/:id", authAdmin_1.default, adminController_1.blockUnblockDoctor);
adminRouter.get("/doctors", authAdmin_1.default, adminController_1.doctorList);
adminRouter.post("/all-doctors", authAdmin_1.default, adminController_1.allDoctors);
adminRouter.get("/doctor/:doctorId", authAdmin_1.default, adminController_1.getDoctors);
adminRouter.post("/change-availability", authAdmin_1.default, doctorController_1.changeAvailability);
adminRouter.get("/appointments", authAdmin_1.default, adminController_1.appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin_1.default, adminController_1.cancelAppointment);
adminRouter.get("/reports", authAdmin_1.default, reportController_1.getAppointmentsReport);
exports.default = adminRouter;
