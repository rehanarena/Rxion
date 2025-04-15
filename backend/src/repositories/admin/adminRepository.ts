import doctorModel from "../../models/doctorModel";
import userModel from "../../models/userModel";
import appointmentModel from "../../models/appoinmentModel";
import { IAdminRepository } from "../../interfaces/Repository/IAdminRepository";

export class AdminRepository implements IAdminRepository {
  async create(doctorData: any): Promise<any> {
    const newDoctor = new doctorModel(doctorData);
    return newDoctor.save();
  }

  async validateAdminCredentials(
    email: string,
    password: string
  ): Promise<boolean> {
    return (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    );
  }

  async getUsers(
    search: string,
    page: number,
    limit: number
  ): Promise<{ users: any[]; total: number }> {
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const users = await userModel.find(query).skip(skip).limit(limit);
    const total = await userModel.countDocuments(query);

    return { users, total };
  }

  async blockUnblockUser(
    id: string,
    action: string
  ): Promise<{ message: string }> {
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

  async blockUnblockDoctor(
    id: string,
    action: string
  ): Promise<{ message: string }> {
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

  async getAllAppointments(options: {
    search: string;
    sortField: string;
    sortOrder: string;
    page: number;
    limit: number;
  }): Promise<any[]> {
    const { search, sortField, sortOrder, page, limit } = options;
    const query: any = {};
    if (search) {
      query["userData.name"] = { $regex: search, $options: "i" };
    }

    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const appointments = await appointmentModel
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return appointments;
  }

  async findAppointmentById(appointmentId: string): Promise<any> {
    return appointmentModel.findById(appointmentId);
  }

  async updateAppointment(appointmentId: string, update: any): Promise<any> {
    return appointmentModel.findByIdAndUpdate(appointmentId, update, {
      new: true,
    });
  }

  async updateDoctorSlots(docId: string, slots_booked: any): Promise<any> {
    return doctorModel.findByIdAndUpdate(
      docId,
      { slots_booked },
      { new: true }
    );
  }
}
