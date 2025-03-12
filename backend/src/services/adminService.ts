// services/AdminService.ts
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { adminRepository } from "../repositories/adminRepository";
import { sendPasswordEmail } from "../helper/mailer";

interface AddDoctorRequestBody {
  name: string;
  email: string;
  password: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: string;
  address: string;
}

export class AdminService {
  private adminRepository: adminRepository;

  constructor() {
    this.adminRepository = new adminRepository();
  }

  async addDoctor(data: AddDoctorRequestBody, imageFile: Express.Multer.File): Promise<void> {
    const { name, email, password, speciality, degree, experience, about, fees, address } = data;

    // Validate required fields
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      throw new Error("Missing Details");
    }

    // Validate email and password strength
    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email");
    }
    if (password.length < 8) {
      throw new Error("Weak password");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    // Parse the address JSON
    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      throw new Error("Invalid address format");
    }

    // Prepare doctor data
    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: parsedAddress,
      date: new Date(),
    };

    // Save to database via repository
    await this.adminRepository.create(doctorData);

    // Send password via email
    await sendPasswordEmail(email, password);
  }

  async loginAdmin(email: string, password: string): Promise<{ token: string }> {
    const isValid = await this.adminRepository.validateAdminCredentials(email, password);
    if (!isValid) {
      throw new Error("Invalid Credentials");
    }
    const token = jwt.sign(
      { email, password },
      process.env.JWT_SECRET as string,
    );
    return { token };
  }

  async getDashboardData(): Promise<{ doctors: number; patients: number }> {
    return this.adminRepository.getDashboardData();
  }

  async getAllUsers() {
    return this.adminRepository.getAllUsers();
  }

  async blockUnblockUser(id: string, action: string): Promise<{ message: string }> {
    return this.adminRepository.blockUnblockUser(id, action);
  }

  async blockUnblockDoctor(id: string, action: string): Promise<{ message: string }> {
    return this.adminRepository.blockUnblockDoctor(id, action);
  }

  // List doctors with pagination and filtering
  async doctorList(params: { search?: string; page?: string; limit?: string; speciality?: string; }) {
    const { search, page = "1", limit = "8", speciality } = params;
    let query: any = {};
    if (speciality) {
      query.speciality = speciality;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;
    const skip = (pageNum - 1) * limitNum;
    const doctors = await this.adminRepository.findDoctors(query, skip, limitNum);
    const totalDoctors = await this.adminRepository.countDoctors(query);

    return {
      totalPages: Math.ceil(totalDoctors / limitNum),
      currentPage: pageNum,
      totalDoctors,
      doctors,
    };
  }

  // Get all doctors (excluding password)
  async allDoctors() {
    return this.adminRepository.getAllDoctors();
  }

  // Get a single doctor by ID
  async getDoctor(doctorId: string) {
    return this.adminRepository.getDoctorById(doctorId);
  }

  // New: Appointment methods

  // Get all appointments
  async getAllAppointments(): Promise<any[]> {
    return this.adminRepository.getAllAppointments();
  }

  // Cancel an appointment and update the doctor's booked slots
  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    // Retrieve appointment details
    const appointmentData = await this.adminRepository.findAppointmentById(appointmentId);
    if (!appointmentData) {
      throw new Error("Appointment not found");
    }

    // Mark the appointment as cancelled
    await this.adminRepository.updateAppointment(appointmentId, { cancelled: true });

    // Extract doctor and slot details from the appointment
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await this.adminRepository.getDoctorById(docId);
    if (!doctorData) {
      throw new Error("Doctor not found");
    }

    let slots_booked = doctorData.slots_booked;
    if (slots_booked && slots_booked[slotDate]) {
      const updatedSlots = (slots_booked[slotDate] as Array<{ date: string; time: string }>)
        .filter((slot) => `${slot.date} ${slot.time}` !== slotTime);
      slots_booked[slotDate] = updatedSlots;
      await this.adminRepository.updateDoctorSlots(docId, slots_booked);
    }

    return { message: "Appointment cancelled successfully" };
  }
}
