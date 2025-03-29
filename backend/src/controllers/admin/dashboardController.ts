import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import appointmentModel from "../../models/appoinmentModel";
import userModel from "../../models/userModel";
import doctorModel from "../../models/doctorModel";

export const getTotal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Count total appointments
    const totalAppointments = await appointmentModel.countDocuments();
    // console.log(totalAppointments)
    // Sum total earnings
    const earningsResult = await appointmentModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalEarnings = earningsResult[0] ? earningsResult[0].total : 0;
    // Count unique patients & doctors using distinct
    const totalPatients = await userModel.countDocuments();
    console.log(totalPatients);
    const totalDoctors = await doctorModel.countDocuments();
    console.log(totalDoctors);

    res.json({ totalAppointments, totalEarnings, totalPatients, totalDoctors });
  } catch (error: any) {
    next(error);
  }
};

export const getRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { period } = req.query;
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
    // Default to daily if no valid period is provided
    groupId = {
      year: { $year: { $toDate: "$date" } },
      month: { $month: { $toDate: "$date" } },
      day: { $dayOfMonth: { $toDate: "$date" } },
    };
  }

  try {
    const revenueData = await appointmentModel.aggregate([
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(revenueData);
  } catch (error: any) {
    next(error);
  }
};

export const getStatusAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
    res.json(statusData);
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
    res.json(paymentData);
  } catch (error) {
    next(error);
  }
};

export const getTopDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const topDoctors = await appointmentModel.aggregate([
      // Convert docId (string) to ObjectId so that it matches doctorModel._id
      {
        $addFields: {
          doctorObjectId: { $toObjectId: "$docId" },
        },
      },
      // Group appointments by the converted doctor ID
      {
        $group: {
          _id: "$doctorObjectId",
          totalAppointments: { $sum: 1 },
          totalEarnings: { $sum: "$amount" },
        },
      },
      // Join with the doctors collection to fetch doctor details
      {
        $lookup: {
          from: "doctors", // This should match the actual MongoDB collection name (usually pluralized)
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      // Unwind the joined array to access doctor fields directly
      {
        $unwind: "$doctorInfo",
      },
      // Project only the fields you need
      {
        $project: {
          _id: 0,
          docId: "$_id",
          name: "$doctorInfo.name",
          totalAppointments: 1,
          totalEarnings: 1,
        },
      },
      // Sort by total appointments (or totalEarnings) in descending order
      { $sort: { totalAppointments: -1 } },
      // Limit to the top doctor (or top N doctors if you remove/adjust the limit)
      { $limit: 1 },
    ]);
    console.log(topDoctors);
    res.json(topDoctors);
  } catch (error) {
    next(error);
  }
};
