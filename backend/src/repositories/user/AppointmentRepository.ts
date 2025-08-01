import appointmentModel, { IAppointment } from "../../models/appoinmentModel";
import { BaseRepository } from "../baseRepository";
import { IAppointmentRepository } from "../../interfaces/Repository/IAppointmentRepository";

export class AppointmentRepository
  extends BaseRepository<IAppointment>
  implements IAppointmentRepository {
  constructor() {
    super(appointmentModel);
  }

  async createAppointment(data: any): Promise<IAppointment> {
    return this.create(data);
  }

  async findAppointmentsByUserId(userId: string): Promise<IAppointment[]> {
    return this.model.find({ userId }).lean().exec();
  }

  async updateAppointment(
    appointmentId: string,
    update: object
  ): Promise<IAppointment | null> {
    return this.updateById(appointmentId, update as Partial<IAppointment>);
  }

  async updatePaymentStatus(
    appointmentId: string,
    update: object
  ): Promise<IAppointment | null> {
    return this.updateById(appointmentId, update as Partial<IAppointment>);
  }
}