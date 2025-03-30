import appointmentModel from "../../models/appoinmentModel";
import { IAppointment } from "../../models/appoinmentModel";

export class AppointmentRepository {
  async createAppointment(appointmentData: any) {
    const appointment = new appointmentModel(appointmentData);
    return await appointment.save();
  }
  async findAppointmentsByUserId(userId: string) {
    return await appointmentModel.find({ userId }).lean();
  }
  async updateAppointment(appointmentId: string, update: object) {
    return await appointmentModel.findByIdAndUpdate(appointmentId, update, {
      new: true,
    });
  }
  async findById(appointmentId: string): Promise<IAppointment | null> {
    return await appointmentModel.findById(appointmentId);
  }
  async updatePaymentStatus(
    appointmentId: string,
    update: object
  ): Promise<IAppointment | null> {
    return await appointmentModel.findByIdAndUpdate(appointmentId, update, {
      new: true,
    });
  }
  async findOne(query: object): Promise<IAppointment | null> {
    return appointmentModel.findOne(query).exec();
  }
}
