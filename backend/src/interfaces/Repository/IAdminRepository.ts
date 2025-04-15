export interface IAdminRepository {
  create(doctorData: any): Promise<any>;
  validateAdminCredentials(email: string, password: string): Promise<boolean>;
  getUsers(
    search: string,
    page: number,
    limit: number
  ): Promise<{ users: any[]; total: number }>;
  blockUnblockUser(id: string, action: string): Promise<{ message: string }>;
  blockUnblockDoctor(id: string, action: string): Promise<{ message: string }>;
  findDoctors(query: any, skip: number, limit: number): Promise<any[]>;
  countDoctors(query: any): Promise<number>;
  getAllDoctors(): Promise<any[]>;
  getDoctorById(doctorId: string): Promise<any>;
  getAllAppointments(options: {
    search: string;
    sortField: string;
    sortOrder: string;
    page: number;
    limit: number;
  }): Promise<any[]>;
  findAppointmentById(appointmentId: string): Promise<any>;
  updateAppointment(appointmentId: string, update: any): Promise<any>;
  updateDoctorSlots(docId: string, slots_booked: any): Promise<any>;
}
