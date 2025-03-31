// repositories/adminRepository.ts
import doctorModel from "../../models/doctorModel";
import userModel from "../../models/userModel";
import appointmentModel from "../../models/appoinmentModel";

export class adminRepository {
  async create(doctorData: any): Promise<any> {
    const newDoctor = new doctorModel(doctorData);
    return newDoctor.save();
  }

  async validateAdminCredentials(email: string, password: string): Promise<boolean> {
    // Compare credentials against environment variables
    return (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    );
  }

  // Repository method
  // async getAdminDashboardData(): Promise<
  //   any

  // > {
  //   try {
  //     // Calculate total counts
  //     // const [doctors, patients, totalAppointments] = await Promise.all([
  //     //   doctorModel.countDocuments({}),
  //     //   userModel.countDocuments({}),
  //     //   appointmentModel.countDocuments({ cancelled: { $ne: true } })
  //     // ]);
  
  //     // Calculate total earnings (only for non-cancelled, paid appointments)
  //     // const earningsAgg = await appointmentModel.aggregate([
  //     //   {
  //     //     $match: {
  //     //       cancelled: { $ne: true },
  //     //       payment: true
  //     //     }
  //     //   },
  //     //   {
  //     //     $group: {
  //     //       _id: null,
  //     //       totalEarnings: { $sum: "$amount" }
  //     //     }
  //     //   }
  //     // ]);
  
  //     // console.log(earningsAgg)
  //     // const totalEarnings = earningsAgg[0]?.totalEarnings || 0;
  
  //     // Monthly earnings for the last 7 months
  //     // const monthlyEarningsAgg = await appointmentModel.aggregate([
  //     //   {
  //     //     $match: {
  //     //       cancelled: { $ne: true },
  //     //       payment: true
  //     //     }
  //     //   },
  //     //   {
  //     //     $group: {
  //     //       _id: {
  //     //         $dateToString: { 
  //     //           format: "%Y-%m", 
  //     //           date: "$createdAt" 
  //     //         }
  //     //       },
  //     //       monthEarnings: { $sum: "$amount" }
  //     //     }
  //     //   },
  //     //   { $sort: { _id: 1 } },
  //     //   { $limit: 7 }
  //     // ]);
  
  //     // Prepare monthly earnings data with padding
  //     // let monthlyEarnings = monthlyEarningsAgg.map(item => item.monthEarnings);
  //     // while (monthlyEarnings.length < 7) {
  //     //   monthlyEarnings.unshift(0);
  //     // }
  
  //     // Appointment trend for the last 7 days (non-cancelled)
  //     // const today = new Date();
  //     // const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
  //     // const appointmentTrendAgg = await appointmentModel.aggregate([
  //     //   {
  //     //     $match: {
  //     //       createdAt: { 
  //     //         $gte: sevenDaysAgo, 
  //     //         $lte: today 
  //     //       },
  //     //       cancelled: { $ne: true }
  //     //     }
  //     //   },
  //     //   {
  //     //     $group: {
  //     //       _id: { $dateToString: { format: "%m-%d", date: "$createdAt" } },
  //     //       count: { $sum: 1 }
  //     //     }
  //     //   },
  //     //   { $sort: { _id: 1 } }
  //     // ]);
  
  //     // const appointmentTrend = {
  //     //   labels: appointmentTrendAgg.map(item => item._id),
  //     //   data: appointmentTrendAgg.map(item => item.count)
  //     // };
  
  //     // return {
  //     //   doctors,
  //     //   patients,
  //     //   appointments: totalAppointments,
  //     //   earnings: totalEarnings,
  //     //   monthlyEarnings,
  //     //   appointmentChartData: appointmentTrend,
  //     //   success: "rena"
  //     // };
  //     return true;
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //     throw new Error("Failed to fetch dashboard data");
  //   }
  // }

  
  
  

  async getAllUsers(): Promise<any[]> {
    return userModel.find();
  }

  async blockUnblockUser(id: string, action: string): Promise<{ message: string }> {
    const user = await userModel.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    if (action === "block") {
      user.isBlocked = true;
    } else if (action === "unblock") {
      user.isBlocked = false;
    } else {
      throw new Error("Invalid action");
    }
    await user.save();
    return { message: `User has been ${action}ed successfully.` };
  }

  async blockUnblockDoctor(id: string, action: string): Promise<{ message: string }> {
    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    if (action === "block") {
      doctor.isBlocked = true;
    } else if (action === "unblock") {
      doctor.isBlocked = false;
    } else {
      throw new Error("Invalid action");
    }
    await doctor.save();
    return { message: `Doctor has been ${action}ed successfully.` };
  }

  async findDoctors(query: any, skip: number, limit: number) {
    return doctorModel.find(query).skip(skip).limit(limit);
  }

  async countDoctors(query: any) {
    return doctorModel.countDocuments(query);
  }

  async getAllDoctors() {
    return doctorModel.find({}).select("-password");
  }

  async getDoctorById(doctorId: string) {
    return doctorModel.findById(doctorId);
  }

  async getAllAppointments(): Promise<any[]> {
    return appointmentModel.find({});
  }

  async findAppointmentById(appointmentId: string): Promise<any> {
    return appointmentModel.findById(appointmentId);
  }

  async updateAppointment(appointmentId: string, update: any): Promise<any> {
    return appointmentModel.findByIdAndUpdate(appointmentId, update, { new: true });
  }

  async updateDoctorSlots(docId: string, slots_booked: any): Promise<any> {
    return doctorModel.findByIdAndUpdate(docId, { slots_booked }, { new: true });
  }
}
