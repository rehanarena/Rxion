import { IDoctorappointmentService } from '../../interfaces/Service/IDoctorappointmentService';
import { IDoctorAppointmentRepository } from '../../interfaces/Repository/IDoctorAppointmentRepository';
import { IAppointment } from '../../models/appoinmentModel';
import {
  sendAppointmentCompletedEmail,
  sendAppointmentCancelledEmail,
} from "../../helper/mailer";

export class AppointmentService implements IDoctorappointmentService {
  private appointmentRepository: IDoctorAppointmentRepository;

  constructor(appointmentRepository: IDoctorAppointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  async getAppointmentsByDoctor(docId: string): Promise<IAppointment[]> {
    return this.appointmentRepository.getAppointmentsByDoctor(docId);
  }

  async completeAppointment(
    docId: string,
    appointmentId: string
  ): Promise<void> {
    const appointmentData = await this.appointmentRepository.getAppointmentById(
      appointmentId
    );
    if (appointmentData && appointmentData.docId === docId) {
      await this.appointmentRepository.updateAppointment(appointmentId, {
        isCompleted: true,
      });
      if (appointmentData.userData) {
        const userData = appointmentData.userData as {
          email: string;
          name: string;
        };
        if (userData.email && userData.name) {
          await sendAppointmentCompletedEmail(userData.email, userData.name);
        }
      }
    } else {
      throw new Error("Mark Failed");
    }
  }

  async cancelAppointment(docId: string, appointmentId: string): Promise<void> {
    const appointmentData = await this.appointmentRepository.getAppointmentById(
      appointmentId
    );
    if (appointmentData && appointmentData.docId === docId) {
      await this.appointmentRepository.updateAppointment(appointmentId, {
        cancelled: true,
      });
      if (appointmentData.userData) {
        const userData = appointmentData.userData as {
          email: string;
          name: string;
        };
        if (userData.email && userData.name) {
          await sendAppointmentCancelledEmail(userData.email, userData.name);
        }
      }
    } else {
      throw new Error("Cancellation Failed");
    }
  }
}
