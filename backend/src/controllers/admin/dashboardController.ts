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
    const totalAppointments = await appointmentModel.countDocuments();
    // console.log(totalAppointments)
    const earningsResult = await appointmentModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalEarnings = earningsResult[0] ? earningsResult[0].total : 0;
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
      {
        $unwind: "$doctorInfo",
      },
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
    console.log(topDoctors);
    res.json(topDoctors);
  } catch (error) {
    next(error);
  }
};
