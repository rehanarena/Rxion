import { IAppointment } from '../../models/appoinmentModel';

export interface IDoctorappointmentService {
  getAppointmentsByDoctor(docId: string): Promise<IAppointment[]>;

  completeAppointment(docId: string, appointmentId: string): Promise<void>;

  cancelAppointment(docId: string, appointmentId: string): Promise<void>;
}
