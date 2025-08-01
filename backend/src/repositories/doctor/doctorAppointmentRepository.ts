import appointmentModel, { IAppointment } from "../../models/appoinmentModel";
import { BaseRepository } from "../baseRepository";
import { IDoctorAppointmentRepository } from "../../interfaces/Repository/IDoctorAppointmentRepository";

export class DoctorAppointmentRepository
  extends BaseRepository<IAppointment>
  implements IDoctorAppointmentRepository
{
  constructor() {
    super(appointmentModel);
  }

  async getAppointmentsByDoctor(docId: string): Promise<IAppointment[]> {
    return this.find({ query: { docId } });
  }

  async getAppointmentById(
    appointmentId: string
  ): Promise<IAppointment | null> {
    return this.findById(appointmentId);
  }

  async updateAppointment(
    appointmentId: string,
    updateData: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return this.updateById(appointmentId, updateData);
  }
}
