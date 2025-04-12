// controllers/ReportController.ts
import { Request, Response, NextFunction } from "express";
import { DashboardRepository } from "../../repositories/admin/dashboardRepository";
import HttpStatus from "../../utils/statusCode"; 

export class DashboardController {
  private dashboardRepository: DashboardRepository;

  // The repository is injected via the constructor
  constructor(dashboardRepository: DashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }

  // Get total reports endpoint
  async getTotal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totals = await this.dashboardRepository.getTotalReports();
      res.status(HttpStatus.OK).json(totals);
    } catch (error) {
      next(error);
    }
  }

  // Get revenue report based on query parameter "period"
  async getRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as string) || "daily";
      const revenueData = await this.dashboardRepository.getRevenueReports(period);
      res.status(HttpStatus.OK).json(revenueData);
    } catch (error) {
      next(error);
    }
  }

  // Get appointment status report
  async getStatusAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusData = await this.dashboardRepository.getStatusAppointmentReports();
      res.status(HttpStatus.OK).json(statusData);
    } catch (error) {
      next(error);
    }
  }

  // Get payment status report
  async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentData = await this.dashboardRepository.getPaymentStatusReports();
      res.status(HttpStatus.OK).json(paymentData);
    } catch (error) {
      next(error);
    }
  }

  // Get top doctor report
  async getTopDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topDoctor = await this.dashboardRepository.getTopDoctorReport();
      res.status(HttpStatus.OK).json(topDoctor);
    } catch (error) {
      next(error);
    }
  }
}
