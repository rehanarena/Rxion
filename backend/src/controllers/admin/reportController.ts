import { Request, Response } from "express";
import Appointment from "../../models/appoinmentModel";

export const getAppointmentsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};

    if (startDate && endDate) {
      const startTimestamp = new Date(startDate as string).getTime();
      const endTimestamp = new Date(endDate as string).getTime();

      if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
         res.status(400).json({
          success: false,
          message: 'Invalid date provided',
        });
        return
      }

      query.date = { $gte: startTimestamp, $lte: endTimestamp };
    }

    const appointments = await Appointment.find(query).sort({ date: -1 });

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

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching appointment report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment report",
    });
  }
};

