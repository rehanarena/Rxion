import { IAppointment } from '../../models/appoinmentModel';

export interface IAppointmentService {
    bookAppointment(token: string, docId: string, slotDate: string, slotTime: string): Promise<string>;
    listAppointments(userId: string): Promise<any>;  
    cancelAppointment(userId: string, appointmentId: string): Promise<string>;
  }
  