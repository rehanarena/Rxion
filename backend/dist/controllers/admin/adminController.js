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
exports.AdminController = void 0;
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    addDoctor(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const imageFile = req.file;
                if (!imageFile) {
                    res
                        .status(statusCode_1.default.BAD_REQUEST)
                        .json({ success: false, message: "Image file missing" });
                    return;
                }
                yield this.adminService.addDoctor(data, imageFile);
                res.status(statusCode_1.default.CREATED).json({
                    success: true,
                    message: "Doctor Added Successfully and Password Sent to Email",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    loginAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { token } = yield this.adminService.loginAdmin(email, password);
                res.status(statusCode_1.default.OK).json({ success: true, token });
            }
            catch (error) {
                next(error);
            }
        });
    }
    userList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const search = req.query.search || "";
                const page = parseInt(req.query.page, 10) || 1;
                const limit = parseInt(req.query.limit, 10) || 10;
                const result = yield this.adminService.getUsers(search, page, limit);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    blockUnblockUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { action } = req.body;
            try {
                const result = yield this.adminService.blockUnblockUser(id, action);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    blockUnblockDoctor(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { action } = req.body;
            try {
                const result = yield this.adminService.blockUnblockDoctor(id, action);
                res.status(statusCode_1.default.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    doctorList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search, page = "1", limit = "8", speciality } = req.query;
                const result = yield this.adminService.doctorList({
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
    }
    allDoctors(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctors = yield this.adminService.allDoctors();
                res.status(statusCode_1.default.OK).json({ success: true, doctors });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getDoctors(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId } = req.params;
            try {
                const doctor = yield this.adminService.getDoctor(doctorId);
                if (!doctor) {
                    res
                        .status(statusCode_1.default.NOT_FOUND)
                        .json({ success: false, message: "Doctor not found" });
                    return;
                }
                res.status(statusCode_1.default.OK).json({ success: true, doctor });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /// All appointment list ///
    appointmentsAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search = "", sortField = "createdAt", sortOrder = "desc", page = "1", limit = "10", } = req.query;
                const options = {
                    search: search.toString(),
                    sortField: sortField.toString(),
                    sortOrder: sortOrder.toString(),
                    page: parseInt(page.toString(), 10),
                    limit: parseInt(limit.toString(), 10),
                };
                const appointments = yield this.adminService.getAllAppointments(options);
                res.status(statusCode_1.default.OK).json({ success: true, appointments });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /// Cancel Appointment ///
    cancelAppointment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId } = req.body;
                const result = yield this.adminService.cancelAppointment(appointmentId);
                res
                    .status(statusCode_1.default.OK)
                    .json({ success: true, message: result.message });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AdminController = AdminController;
