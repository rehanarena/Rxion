// repositories/adminRepository.ts
import doctorModel from "../../models/doctorModel";
import userModel from "../../models/userModel";
import appointmentModel from "../../models/appoinmentModel";

export class adminRepository {
  async create(doctorData: any): Promise<any> {
    const newDoctor = new doctorModel(doctorData);
    return newDoctor.save();
  }

  async validateAdminCredentials(email: string, password: string): Promise<boolean> {
    // Compare credentials against environment variables
    return (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    );
  }

  async getDashboardData(): Promise<{
    doctors: number;
    patients: number;
    latestAppointments: any[];
  }> {
    const doctors = await doctorModel.find({});
    const patients = await userModel.find({});
    const latestAppointments = await appointmentModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(5);
  
    return {
      doctors: doctors.length,
      patients: patients.length,
      latestAppointments,
    };
  }
  

  async getAllUsers(): Promise<any[]> {
    return userModel.find();
  }

  // Method for blocking/unblocking a user
  async blockUnblockUser(id: string, action: string): Promise<{ message: string }> {
    const user = await userModel.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    if (action === "block") {
      user.isBlocked = true;
    } else if (action === "unblock") {
      user.isBlocked = false;
    } else {
      throw new Error("Invalid action");
    }
    await user.save();
    return { message: `User has been ${action}ed successfully.` };
  }

  // Method for blocking/unblocking a doctor
  async blockUnblockDoctor(id: string, action: string): Promise<{ message: string }> {
    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    if (action === "block") {
      doctor.isBlocked = true;
    } else if (action === "unblock") {
      doctor.isBlocked = false;
    } else {
      throw new Error("Invalid action");
    }
    await doctor.save();
    return { message: `Doctor has been ${action}ed successfully.` };
  }

  // New: Get doctors list with pagination & search
  async findDoctors(query: any, skip: number, limit: number) {
    return doctorModel.find(query).skip(skip).limit(limit);
  }

  // New: Count the number of doctors matching a query
  async countDoctors(query: any) {
    return doctorModel.countDocuments(query);
  }

  // New: Get all doctors excluding the password field
  async getAllDoctors() {
    return doctorModel.find({}).select("-password");
  }

  // New: Get a single doctor by ID
  async getDoctorById(doctorId: string) {
    return doctorModel.findById(doctorId);
  }

  // New: Appointment-related methods

  // Get all appointments
  async getAllAppointments(): Promise<any[]> {
    return appointmentModel.find({});
  }

  // Find an appointment by its ID
  async findAppointmentById(appointmentId: string): Promise<any> {
    return appointmentModel.findById(appointmentId);
  }

  // Update an appointment with the given update object
  async updateAppointment(appointmentId: string, update: any): Promise<any> {
    return appointmentModel.findByIdAndUpdate(appointmentId, update, { new: true });
  }

  // Update a doctor's booked slots (used during cancellation)
  async updateDoctorSlots(docId: string, slots_booked: any): Promise<any> {
    return doctorModel.findByIdAndUpdate(docId, { slots_booked }, { new: true });
  }
}
