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
exports.DashboardController = void 0;
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
class DashboardController {
    // The repository is injected via the constructor
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    // Get total reports endpoint
    getTotal(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totals = yield this.dashboardRepository.getTotalReports();
                res.status(statusCode_1.default.OK).json(totals);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get revenue report based on query parameter "period"
    getRevenue(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const period = req.query.period || "daily";
                const revenueData = yield this.dashboardRepository.getRevenueReports(period);
                res.status(statusCode_1.default.OK).json(revenueData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get appointment status report
    getStatusAppointment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statusData = yield this.dashboardRepository.getStatusAppointmentReports();
                res.status(statusCode_1.default.OK).json(statusData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get payment status report
    getPaymentStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentData = yield this.dashboardRepository.getPaymentStatusReports();
                res.status(statusCode_1.default.OK).json(paymentData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get top doctor report
    getTopDoctors(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const topDoctor = yield this.dashboardRepository.getTopDoctorReport();
                res.status(statusCode_1.default.OK).json(topDoctor);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.DashboardController = DashboardController;
