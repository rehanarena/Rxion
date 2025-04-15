import appointmentModel from "../../models/appoinmentModel";
import { IAppointment } from "../../models/appoinmentModel";
import { IAppointmentRepository } from "../../interfaces/Repository/IAppointmentRepository";

export class AppointmentRepository implements IAppointmentRepository {

  async createAppointment(appointmentData: any): Promise<IAppointment> {
    const appointment = new appointmentModel(appointmentData);
    return await appointment.save();
  }

  async findAppointmentsByUserId(userId: string): Promise<IAppointment[]> {
    return await appointmentModel.find({ userId }).lean();
  }

  async findById(appointmentId: string): Promise<IAppointment | null> {
    return await appointmentModel.findById(appointmentId);
  }

  async updateAppointment(appointmentId: string, update: object): Promise<IAppointment | null> {
    return await appointmentModel.findByIdAndUpdate(appointmentId, update, { new: true });
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
