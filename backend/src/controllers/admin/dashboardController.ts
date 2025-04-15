import { Request, Response, NextFunction } from "express";
import HttpStatus from "../../utils/statusCode";
import { IDashboardRepository } from "../../interfaces/Repository/IDashboardRepository";

export class DashboardController {
  private dashboardRepository: IDashboardRepository;

  constructor(dashboardRepository: IDashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }

  async getTotal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const totals = await this.dashboardRepository.getTotalReports();
      res.status(HttpStatus.OK).json(totals);
    } catch (error) {
      next(error);
    }
  }
  async getRevenue(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const period = (req.query.period as string) || "daily";
      const revenueData = await this.dashboardRepository.getRevenueReports(
        period
      );
      res.status(HttpStatus.OK).json(revenueData);
    } catch (error) {
      next(error);
    }
  }
  async getStatusAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusData =
        await this.dashboardRepository.getStatusAppointmentReports();
      res.status(HttpStatus.OK).json(statusData);
    } catch (error) {
      next(error);
    }
  }
  async getPaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const paymentData =
        await this.dashboardRepository.getPaymentStatusReports();
      res.status(HttpStatus.OK).json(paymentData);
    } catch (error) {
      next(error);
    }
  }
  async getTopDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const topDoctor = await this.dashboardRepository.getTopDoctorReport();
      res.status(HttpStatus.OK).json(topDoctor);
    } catch (error) {
      next(error);
    }
  }
}
