"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = exports.appointmentsAdmin = exports.allDoctors = exports.doctorList = exports.blockUnblockDoctor = exports.blockUnblockUser = exports.userList = exports.loginAdmin = exports.addDoctor = exports.getDoctors = void 0;
const adminService_1 = require("../services/admin/adminService");
const statusCode_1 = __importDefault(require("../utils/statusCode"));
const adminServiceInstance = new adminService_1.AdminService();
const addDoctor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const imageFile = req.file;
        if (!imageFile) {
            res.status(statusCode_1.default.BAD_REQUEST).json({ success: false, message: "Image file missing" });
            return;
        }
        yield adminServiceInstance.addDoctor(data, imageFile);
        res.status(statusCode_1.default.CREATED).json({
            success: true,
            message: "Doctor Added Successfully and Password Sent to Email",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addDoctor = addDoctor;
const loginAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { token } = yield adminServiceInstance.loginAdmin(email, password);
        res.status(statusCode_1.default.OK).json({ success: true, token });
    }
    catch (error) {
        next(error);
    }
});
exports.loginAdmin = loginAdmin;
/// Dashboard ///
// const adminDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const dashData = await adminServiceInstance.getDashboardData(next);
//     res.status(HttpStatus.OK).json({ success: true, dashData });
//   } catch (error: any) {
//     next(error);
//   }
// };
const userList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield adminServiceInstance.getAllUsers();
        res.status(statusCode_1.default.OK).json(users);
    }
    catch (error) {
        next(error);
    }
});
exports.userList = userList;
const blockUnblockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { action } = req.body;
    try {
        const result = yield adminServiceInstance.blockUnblockUser(id, action);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.blockUnblockUser = blockUnblockUser;
const blockUnblockDoctor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { action } = req.body;
    try {
        const result = yield adminServiceInstance.blockUnblockDoctor(id, action);
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.blockUnblockDoctor = blockUnblockDoctor;
const doctorList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, page = "1", limit = "8", speciality } = req.query;
        const result = yield adminServiceInstance.doctorList({
            search: search,
            page: page,
            limit: limit,
            speciality: speciality,
        });
        res.status(statusCode_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.doctorList = doctorList;
const allDoctors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield adminServiceInstance.allDoctors();
        res.status(statusCode_1.default.OK).json({ success: true, doctors });
    }
    catch (error) {
        next(error);
    }
});
exports.allDoctors = allDoctors;
const getDoctors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { doctorId } = req.params;
    try {
        const doctor = yield adminServiceInstance.getDoctor(doctorId);
        if (!doctor) {
            res.status(statusCode_1.default.NOT_FOUND).json({ success: false, message: "Doctor not found" });
            return;
        }
        res.status(statusCode_1.default.OK).json({ success: true, doctor });
    }
    catch (error) {
        next(error);
    }
});
exports.getDoctors = getDoctors;
/// All appointment list ///
const appointmentsAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield adminServiceInstance.getAllAppointments();
        res.status(statusCode_1.default.OK).json({ success: true, appointments });
    }
    catch (error) {
        next(error);
    }
});
exports.appointmentsAdmin = appointmentsAdmin;
/// Cancel Appointment ///
const cancelAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointmentId } = req.body;
        const result = yield adminServiceInstance.cancelAppointment(appointmentId);
        res.status(statusCode_1.default.OK).json({ success: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
});
exports.cancelAppointment = cancelAppointment;
