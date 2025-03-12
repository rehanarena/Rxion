// services/AppointmentService.ts
import jwt from 'jsonwebtoken';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

export class AppointmentService {
  private doctorRepository: DoctorRepository;
  private userRepository: UserRepository;
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
    this.userRepository = new UserRepository();
    this.appointmentRepository = new AppointmentRepository();
  }

  async bookAppointment(token: string, docId: string, slotDate: string, slotTime: string): Promise<string> {
    // Verify token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const userId = decoded.id;

    // Retrieve doctor data
    const docData = await this.doctorRepository.findById(docId);
    if (!docData) {
      throw new Error("Doctor not found");
    }
    if (!docData.available) {
      throw new Error("Doctor not available");
    }
    if (!docData.fees) {
      throw new Error("Doctor fees not found");
    }

    // Initialize slots_booked as object if needed
    if (!docData.slots_booked || Array.isArray(docData.slots_booked)) {
      docData.slots_booked = {};
    }
    if (!docData.slots_booked[slotDate]) {
      docData.slots_booked[slotDate] = [];
    }

    // Format slotTime and extract date/time parts
    const formattedSlotTime = new Date(slotTime).toISOString();
    const slotDatePart = formattedSlotTime.split("T")[0];
    const slotTimePart = new Date(formattedSlotTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Check if the slot is already booked
    const isSlotBooked = docData.slots_booked[slotDate].some(
      (slot: any) => slot.date === slotDatePart && slot.time === slotTimePart
    );
    if (isSlotBooked) {
      throw new Error("Slot not available");
    }

    // Book the slot by adding it to the doctor's slots_booked
    docData.slots_booked[slotDate].push({
      date: slotDatePart,
      time: slotTimePart,
    });
    docData.markModified("slots_booked");
    await this.doctorRepository.updateDoctor(docData);

    // Retrieve user data (selecting without password if needed)
    const userData = await this.userRepository.findById(userId);
    if (!userData) {
      throw new Error("User not found");
    }

    // Build appointment data
    const appointmentData = {
      userId,
      docId,
      userData,
      doctData: docData,
      amount: docData.fees,
      slotTime: formattedSlotTime,
      slotDate,
      date: new Date(),
    };

    // Save the appointment
    await this.appointmentRepository.createAppointment(appointmentData);

    return "Appointment booked successfully";
  }
  async listAppointments(userId: string) {
    return await this.appointmentRepository.findAppointmentsByUserId(userId);
  }
  async cancelAppointment(userId: string, appointmentId: string): Promise<string> {
    // Retrieve appointment
    const appointmentData = await this.appointmentRepository.findById(appointmentId);
    if (!appointmentData) {
      throw new Error("Appointment not found");
    }
    if (appointmentData.userId.toString() !== userId) {
      throw new Error("Unauthorized action");
    }

    // Mark appointment as cancelled
    await this.appointmentRepository.updateAppointment(appointmentId, { cancelled: true });

    // Refund amount to wallet if payment exists
    if (appointmentData.payment) {
      await this.userRepository.updateUser(userId, { $inc: { walletBalance: appointmentData.amount } });
    }

    // Update doctor's booked slots
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await this.doctorRepository.findById(docId);
    if (!doctorData) {
      throw new Error("Doctor not found");
    }

    let slots_booked = doctorData.slots_booked;

    const formattedSlotTime = new Date(slotTime).toISOString();
    const slotTimePart = new Date(formattedSlotTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (slot: any) => slot.time !== slotTimePart
      );
    }
    await this.doctorRepository.updateDoctor(docId, { slots_booked });

    return "Appointment cancelled and amount refunded to wallet";
  }
}
