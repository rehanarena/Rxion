export interface IDashboardRepository {
  /**
   * Gets totals for key metrics.
   */
  getTotalReports(): Promise<{
    totalAppointments: number;
    totalEarnings: number;
    totalPatients: number;
    totalDoctors: number;
  }>;

  getRevenueReports(period: string): Promise<any>;

  getStatusAppointmentReports(): Promise<any>;

  getPaymentStatusReports(): Promise<any>;

  getTopDoctorReport(): Promise<any>;

  getAppointmentsReport(startDate?: string, endDate?: string): Promise<any[]>;
}
