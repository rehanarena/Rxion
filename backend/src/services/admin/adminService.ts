import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { AdminRepository } from "../../repositories/admin/adminRepository";
import { sendPasswordEmail } from "../../helper/mailer";
import { AddDoctorRequestBody } from "../../interfaces/Doctor/doctor";
import { AppointmentOptions } from "../../interfaces/Appointment/appointment";

export class AdminService {
  private adminRepository: AdminRepository;

  constructor(adminRepository: AdminRepository) {
    this.adminRepository = adminRepository;
  }

  async addDoctor(
    data: AddDoctorRequestBody,
    imageFile: Express.Multer.File
  ): Promise<void> {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = data;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      throw new Error("Missing Details");
    }

    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email");
    }
    if (password.length < 8) {
      throw new Error("Weak password");
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      throw new Error("Invalid address format");
    }

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

    await this.adminRepository.create(doctorData);

    await sendPasswordEmail(email, password);
  }

  async loginAdmin(
    email: string,
    password: string
  ): Promise<{ token: string }> {
    const isValid = await this.adminRepository.validateAdminCredentials(
      email,
      password
    );
    if (!isValid) {
      throw new Error("Invalid Credentials");
    }
    const token = jwt.sign(
      { email, password },
      process.env.JWT_SECRET as string
    );
    return { token };
  }

  async getUsers(search: string, page: number, limit: number) {
    return this.adminRepository.getUsers(search, page, limit);
  }

  async blockUnblockUser(
    id: string,
    action: string
  ): Promise<{ message: string }> {
    return this.adminRepository.blockUnblockUser(id, action);
  }

  async blockUnblockDoctor(
    id: string,
    action: string
  ): Promise<{ message: string }> {
    return this.adminRepository.blockUnblockDoctor(id, action);
  }

  async doctorList(params: {
    search?: string;
    page?: string;
    limit?: string;
    speciality?: string;
  }) {
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
    const doctors = await this.adminRepository.findDoctors(
      query,
      skip,
      limitNum
    );
    const totalDoctors = await this.adminRepository.countDoctors(query);

    return {
      totalPages: Math.ceil(totalDoctors / limitNum),
      currentPage: pageNum,
      totalDoctors,
      doctors,
    };
  }

  async allDoctors() {
    return this.adminRepository.getAllDoctors();
  }

  async getDoctor(doctorId: string) {
    return this.adminRepository.getDoctorById(doctorId);
  }

  async getAllAppointments(options: AppointmentOptions): Promise<any[]> {
    return this.adminRepository.getAllAppointments(options);
  }
  // async searchAppointments({
  //   search,
  //   sortBy,
  //   page,
  //   limit,
  // }: {
  //   search: string;
  //   sortBy: string;
  //   page: number;
  //   limit: number;
  // }) {

  //   let query: any = {};

  //   if (search) {
  //     query.$or = [
  //       { "user.name": { $regex: search, $options: "i" } },
  //       { "doctor.name": { $regex: search, $options: "i" } },
  //       { status: { $regex: search, $options: "i" } }
  //     ];
  //   }

  //   let sortOptions: any = {};
  //   if (sortBy === "date") {
  //     sortOptions.date = -1;
  //   } else if (sortBy === "status") {
  //     sortOptions.status = 1;
  //   }

  //   const skip = (page - 1) * limit;
  //   const appointments = await appointmentModel
  //     .find(query)
  //     .sort(sortOptions)
  //     .skip(skip)
  //     .limit(limit);

  //   const totalAppointments = await appointmentModel.countDocuments(query);

  //   return {
  //     appointments,
  //     totalPages: Math.ceil(totalAppointments / limit),
  //     currentPage: page,
  //   };
  // }

  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    const appointmentData = await this.adminRepository.findAppointmentById(
      appointmentId
    );
    if (!appointmentData) {
      throw new Error("Appointment not found");
    }

    await this.adminRepository.updateAppointment(appointmentId, {
      cancelled: true,
    });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await this.adminRepository.getDoctorById(docId);
    if (!doctorData) {
      throw new Error("Doctor not found");
    }

    let slots_booked = doctorData.slots_booked;
    if (slots_booked && slots_booked[slotDate]) {
      const updatedSlots = (
        slots_booked[slotDate] as Array<{ date: string; time: string }>
      ).filter((slot) => `${slot.date} ${slot.time}` !== slotTime);
      slots_booked[slotDate] = updatedSlots;
      await this.adminRepository.updateDoctorSlots(docId, slots_booked);
    }

    return { message: "Appointment cancelled successfully" };
  }
}
