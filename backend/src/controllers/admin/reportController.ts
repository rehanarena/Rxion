// controllers/reportController.ts
import { Request, Response } from "express";
import Appointment from "../../models/appoinmentModel";

/**
 * GET /api/reports/appointments?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Returns a report of appointments filtered by a date range.
 */
export const getAppointmentsReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Build filter for appointments based on the numeric 'date' field
    const query: any = {};
    if (startDate && endDate) {
      // Convert incoming date strings to timestamps.
      // If your slotDate is stored differently, adjust the logic accordingly.
      const startTimestamp = new Date(startDate as string).getTime();
      const endTimestamp = new Date(endDate as string).getTime();
      
      query.date = { $gte: startTimestamp, $lte: endTimestamp };
    }

    // Query the appointments (sorted descending by date)
    const appointments = await Appointment.find(query).sort({ date: -1 });

    // Map the appointments into the desired report format
    const reportData = appointments.map((appt) => {
      return {
        appointmentId: appt._id,
        doctor: (appt.doctData && (appt.doctData as any).name) || "N/A",
        patient: (appt.userData && (appt.userData as any).name) || "N/A",
        date: appt.slotDate,
        time: appt.slotTime,
        paymentStatus: appt.payment ? "Paid" : "Pending",
        fees: appt.amount,
      };
    });

    return res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching appointment report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment report",
    });
  }
};
