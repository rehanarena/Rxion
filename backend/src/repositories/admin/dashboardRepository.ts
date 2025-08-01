import { BaseRepository } from "../baseRepository";
import appointmentModel, { IAppointment } from "../../models/appoinmentModel";
import userModel,        { IUser }        from "../../models/userModel";
import doctorModel,      { IDoctor }      from "../../models/doctorModel";
import { IDashboardRepository } from "../../interfaces/Repository/IDashboardRepository";

export class DashboardRepository implements IDashboardRepository {
  private appts   = new BaseRepository<IAppointment>(appointmentModel);
  private users   = new BaseRepository<IUser>       (userModel);
  private doctors = new BaseRepository<IDoctor>     (doctorModel);

  async getTotalReports() {
    const [ totalAppointments, earningsAgg, totalPatients, totalDoctors ] =
      await Promise.all([
        this.appts.count(),
        this.appts.aggregate<{ _id: null; total: number }>([
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        this.users.count(),
        this.doctors.count()
      ]);

    const totalEarnings = earningsAgg[0]?.total ?? 0;
    return { totalAppointments, totalEarnings, totalPatients, totalDoctors };
  }

  async getRevenueReports(period: string) {
    let groupId: Record<string, any>;
    switch (period) {
      case "daily":
        groupId = {
          year: { $year: { $toDate: "$date" } },
          month: { $month:{ $toDate: "$date" } },
          day: { $dayOfMonth:{ $toDate: "$date" } },
        };
        break;
      case "weekly":
        groupId = {
          year: { $year:{ $toDate: "$date" } },
          week: { $week:{ $toDate: "$date" } },
        };
        break;
      case "monthly":
        groupId = {
          year: { $year:{ $toDate: "$date" } },
          month: { $month:{ $toDate: "$date" } },
        };
        break;
      case "yearly":
        groupId = { year: { $year:{ $toDate: "$date" } } };
        break;
      default:
        groupId = {
          year: { $year:{ $toDate: "$date" } },
          month: { $month:{ $toDate: "$date" } },
          day: { $dayOfMonth:{ $toDate: "$date" } },
        };
    }

    return this.appts.aggregate([
      { $group: { _id: groupId, totalRevenue: { $sum: "$amount" } } },
      { $sort:  { "_id": 1 } }
    ]);
  }

  async getStatusAppointmentReports() {
    return this.appts.aggregate([
      {
        $group: {
          _id: {
            status: {
              $cond: [
                { $eq: ["$cancelled", true] }, "Cancelled",
                { $cond: [ { $eq: ["$isCompleted", true] }, "Completed", "Pending" ] }
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getPaymentStatusReports() {
    return this.appts.aggregate([
      {
        $group: {
          _id: { payment: { $cond: [ { $eq: ["$payment", true] }, "Paid", "Unpaid" ] } },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getTopDoctorReport() {
    return this.appts.aggregate([
      { $addFields: { doctorObjectId: { $toObjectId: "$docId" } } },
      { $group: {
          _id: "$doctorObjectId",
          totalAppointments: { $sum: 1 },
          totalEarnings:     { $sum: "$amount" }
        }
      },
      { $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo"
        }
      },
      { $unwind: "$doctorInfo" },
      { $project: {
          _id:               0,
          docId:             "$_id",
          name:              "$doctorInfo.name",
          totalAppointments: 1,
          totalEarnings:     1
        }
      },
      { $sort:  { totalAppointments: -1 } },
      { $limit: 1 }
    ]);
  }

  async getAppointmentsReport(startDate?: string, endDate?: string) {
    const query: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end   = new Date(endDate).getTime();
      if (isNaN(start)||isNaN(end)) throw new Error("Invalid dates");
      query.date = { $gte: start, $lte: end };
    }

    const raw = await this.appts.find({ sort: { date: -1 }, query });
    return raw.map(appt => ({
      appointmentId: (appt as any).appointmentId,
      doctor:        (appt as any).doctData?.name ?? "N/A",
      patient:       (appt as any).userData?.name ?? "N/A",
      date:          appt.slotDate,
      time:          appt.slotTime,
      paymentStatus: appt.payment ? "Paid" : "Pending",
      fees:          appt.amount,
    }));
  }
}
