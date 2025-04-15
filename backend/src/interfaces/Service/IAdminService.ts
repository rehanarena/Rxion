import { AddDoctorRequestBody } from "../../interfaces/Doctor/doctor";
import { AppointmentOptions } from "../../interfaces/Appointment/appointment";

export interface IAdminService {
  addDoctor(
    data: AddDoctorRequestBody,
    imageFile: Express.Multer.File
  ): Promise<void>;
  loginAdmin(email: string, password: string): Promise<{ token: string }>;
  getUsers(
    search: string,
    page: number,
    limit: number
  ): Promise<{ users: any[]; total: number }>;
  blockUnblockUser(id: string, action: string): Promise<{ message: string }>;
  blockUnblockDoctor(id: string, action: string): Promise<{ message: string }>;
  doctorList(params: {
    search?: string;
    page?: string;
    limit?: string;
    speciality?: string;
  }): Promise<{
    totalPages: number;
    currentPage: number;
    totalDoctors: number;
    doctors: any[];
  }>;
  allDoctors(): Promise<any[]>;
  getDoctor(doctorId: string): Promise<any>;
  getAllAppointments(options: AppointmentOptions): Promise<any[]>;
  cancelAppointment(appointmentId: string): Promise<{ message: string }>;
}
