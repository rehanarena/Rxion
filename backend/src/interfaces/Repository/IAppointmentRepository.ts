// src/interfaces/Repository/IAppointmentRepository.ts

import { IAppointment } from '../../models/appoinmentModel';

export interface IAppointmentRepository {
  createAppointment(appointmentData: any): Promise<IAppointment>;

  findAppointmentsByUserId(userId: string): Promise<IAppointment[]>;

  findById(appointmentId: string): Promise<IAppointment | null>;

  updateAppointment(
    appointmentId: string,
    update: object
  ): Promise<IAppointment | null>;

  updatePaymentStatus(
    appointmentId: string,
    update: object
  ): Promise<IAppointment | null>;

  findOne(query: object): Promise<IAppointment | null>;
}
