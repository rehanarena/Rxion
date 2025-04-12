import appointmentModel from "../../models/appoinmentModel";
import userModel from "../../models/userModel";
import doctorModel from "../../models/doctorModel";

export class DashboardRepository {
  async getTotalReports(): Promise<{
    totalAppointments: number;
    totalEarnings: number;
    totalPatients: number;
    totalDoctors: number;
  }> {
    const totalAppointments = await appointmentModel.countDocuments();
    const earningsResult = await appointmentModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalEarnings = earningsResult[0] ? earningsResult[0].total : 0;
    const totalPatients = await userModel.countDocuments();
    const totalDoctors = await doctorModel.countDocuments();
    return { totalAppointments, totalEarnings, totalPatients, totalDoctors };
  }

  async getRevenueReports(period: string): Promise<any> {
    let groupId;

    if (period === "daily") {
      groupId = {
        year: { $year: { $toDate: "$date" } },
        month: { $month: { $toDate: "$date" } },
        day: { $dayOfMonth: { $toDate: "$date" } },
      };
    } else if (period === "weekly") {
      groupId = {
        year: { $year: { $toDate: "$date" } },
        week: { $week: { $toDate: "$date" } },
      };
    } else if (period === "monthly") {
      groupId = {
        year: { $year: { $toDate: "$date" } },
        month: { $month: { $toDate: "$date" } },
      };
    } else if (period === "yearly") {
      groupId = { year: { $year: { $toDate: "$date" } } };
    } else {
      groupId = {
        year: { $year: { $toDate: "$date" } },
        month: { $month: { $toDate: "$date" } },
        day: { $dayOfMonth: { $toDate: "$date" } },
      };
    }

    const revenueData = await appointmentModel.aggregate([
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return revenueData;
  }

  async getStatusAppointmentReports(): Promise<any> {
    const statusData = await appointmentModel.aggregate([
      {
        $group: {
          _id: {
            status: {
              $cond: [
                { $eq: ["$cancelled", true] },
                "Cancelled",
                {
                  $cond: [
                    { $eq: ["$isCompleted", true] },
                    "Completed",
                    "Pending",
                  ],
                },
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    return statusData;
  }

  async getPaymentStatusReports(): Promise<any> {
    const paymentData = await appointmentModel.aggregate([
      {
        $group: {
          _id: {
            payment: { $cond: [{ $eq: ["$payment", true] }, "Paid", "Unpaid"] },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    return paymentData;
  }

  async getTopDoctorReport(): Promise<any> {
    const topDoctors = await appointmentModel.aggregate([
      {
        $addFields: {
          doctorObjectId: { $toObjectId: "$docId" },
        },
      },
      {
        $group: {
          _id: "$doctorObjectId",
          totalAppointments: { $sum: 1 },
          totalEarnings: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      { $unwind: "$doctorInfo" },
      {
        $project: {
          _id: 0,
          docId: "$_id",
          name: "$doctorInfo.name",
          totalAppointments: 1,
          totalEarnings: 1,
        },
      },
      { $sort: { totalAppointments: -1 } },
      { $limit: 1 },
    ]);
    return topDoctors;
  }
  async getAppointmentsReport(startDate?: string, endDate?: string): Promise<any[]> {
    const query: any = {};

    if (startDate && endDate) {
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();

      if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
        throw new Error("Invalid date provided");
      }

      query.date = { $gte: startTimestamp, $lte: endTimestamp };
    }

    const appointments = await appointmentModel.find(query).sort({ date: -1 });

    const reportData = appointments.map((appt) => ({
      appointmentId: appt._id,
      doctor: (appt.doctData && (appt.doctData as any).name) || "N/A",
      patient: (appt.userData && (appt.userData as any).name) || "N/A",
      date: appt.slotDate,
      time: appt.slotTime,
      paymentStatus: appt.payment ? "Paid" : "Pending",
      fees: appt.amount,
    }));

    return reportData;
  }
}
