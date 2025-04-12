import { Request, Response, NextFunction } from "express";
import HttpStatus from "../../utils/statusCode";
import { DashboardRepository } from "../../repositories/admin/dashboardRepository";

export class ReportController {
  private dashboardRepository: DashboardRepository;

  constructor(dashboardRepository: DashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }

  async getAppointmentsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const reportData = await this.dashboardRepository.getAppointmentsReport(
        startDate as string | undefined,
        endDate as string | undefined
      );

      res.status(HttpStatus.OK).json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      next(error)
  }
}
}
