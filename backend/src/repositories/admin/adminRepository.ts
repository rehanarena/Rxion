import { BaseRepository } from "../baseRepository";
import userModel, { IUser } from "../../models/userModel";
import doctorModel, { IDoctor } from "../../models/doctorModel";
import appointmentModel, { IAppointment } from "../../models/appoinmentModel";
import { IAdminRepository } from "../../interfaces/Repository/IAdminRepository";

export class AdminRepository implements IAdminRepository {
  private users = new BaseRepository<IUser>(userModel);
  private doctors = new BaseRepository<IDoctor>(doctorModel);
  private appointments = new BaseRepository<IAppointment>(appointmentModel);

  async create(data: Partial<IDoctor>): Promise<IDoctor> {
    return this.doctors.create(data);
  }

  async validateAdminCredentials(email: string, password: string): Promise<boolean> {
    return (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    );
  }
  async getUsers(
    search: string,
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    const query = search
      ? { $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ] }
      : {};

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.users.find({ query, sort: { createdAt: -1 }, skip, limit }),
      this.users.count(query),
    ]);

    return { users, total };
  }

  async blockUnblockUser(
    id: string,
    action: "block" | "unblock"
  ): Promise<{ message: string }> {
    const value = action === "block";
    const updated = await this.users.updateById(id, { isBlocked: value } as any);
    if (!updated) throw new Error("User not found");
    return { message: `User has been ${action}ed successfully.` };
  }

  async blockUnblockDoctor(
    id: string,
    action: "block" | "unblock"
  ): Promise<{ message: string }> {
    const value = action === "block";
    const updated = await this.doctors.updateById(id, { isBlocked: value } as any);
    if (!updated) throw new Error("Doctor not found");
    return { message: `Doctor has been ${action}ed successfully.` };
  }

  async findDoctors(
    query: object,
    skip: number,
    limit: number
  ): Promise<IDoctor[]> {
    return this.doctors.find({ query, skip, limit });
  }

  async countDoctors(query: object): Promise<number> {
    return this.doctors.count(query);
  }

  async getAllDoctors(): Promise<IDoctor[]> {
    return this.doctors.find({ projection: "-password" });
  }

  async getDoctorById(doctorId: string): Promise<IDoctor | null> {
    return this.doctors.findById(doctorId);
  }

  async getAllAppointments(opts: {
    search: string;
    sortField: string;
    sortOrder: string;
    page: number;
    limit: number;
  }): Promise<IAppointment[]> {
    const { search, sortField, sortOrder, page, limit } = opts;
    const query = search
      ? { "userData.name": { $regex: search, $options: "i" } }
      : {};

    const skip = (page - 1) * limit;
    const order = sortOrder.toLowerCase() === "desc" ? -1 : 1;

    return this.appointments.find({
      query,
      sort: { [sortField]: order },
      skip,
      limit,
    });
  }

  async findAppointmentById(appointmentId: string): Promise<IAppointment | null> {
    return this.appointments.findById(appointmentId);
  }

  async updateAppointment(
    appointmentId: string,
    update: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return this.appointments.updateById(appointmentId, update);
  }

  async updateDoctorSlots(
    docId: string,
    slots_booked: number
  ): Promise<IDoctor | null> {
    return this.doctors.updateById(docId, { slots_booked } as any);
  }
}
