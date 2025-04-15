import appointmentModel from "../../models/appoinmentModel";
import { IAppointment } from "../../models/appoinmentModel";
import { IDoctorAppointmentRepository } from "../../interfaces/Repository/IDoctorAppointmentRepository";

export class DoctorAppointmentRepository implements IDoctorAppointmentRepository {
  async getAppointmentsByDoctor(docId: string): Promise<IAppointment[]> {
    return appointmentModel.find({ docId });
  }

  async getAppointmentById(
    appointmentId: string
  ): Promise<IAppointment | null> {
    return appointmentModel.findById(appointmentId);
  }

  async updateAppointment(
    appointmentId: string,
    updateData: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return appointmentModel.findByIdAndUpdate(appointmentId, updateData, {
      new: true,
    });
  }
}
