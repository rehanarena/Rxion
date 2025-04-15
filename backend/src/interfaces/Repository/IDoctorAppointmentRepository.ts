import { IAppointment } from '../../models/appoinmentModel';

export interface IDoctorAppointmentRepository {
  getAppointmentsByDoctor(docId: string): Promise<IAppointment[]>;

  getAppointmentById(appointmentId: string): Promise<IAppointment | null>;

  updateAppointment(
    appointmentId: string,
    updateData: Partial<IAppointment>
  ): Promise<IAppointment | null>;
}
