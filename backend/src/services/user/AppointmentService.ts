import jwt from "jsonwebtoken";
import { IDoctorRepository } from "../../interfaces/Repository/IDoctorRepository";
import { IUserRepository } from "../../interfaces/Repository/IUserRepository";
import { IAppointmentRepository } from "../../interfaces/Repository/IAppointmentRepository";
import { IAppointmentService } from "../../interfaces/Service/IAppointmentService";
import { sendAppointmentBookedEmail } from "../../helper/mailer";


export class AppointmentService implements IAppointmentService {
  private doctorRepository: IDoctorRepository;
  private userRepository: IUserRepository;
  private appointmentRepository: IAppointmentRepository;

  constructor(
    doctorRepository: IDoctorRepository,
    userRepository: IUserRepository,
    appointmentRepository: IAppointmentRepository
  ) {
    this.doctorRepository = doctorRepository;
    this.userRepository = userRepository;
    this.appointmentRepository = appointmentRepository;
  }

  async bookAppointment(
    token: string,
    docId: string,
    slotDate: string,
    slotTime: string
  ): Promise<string> {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const userId = decoded.id;

    const docData = await this.doctorRepository.findById(docId);
    if (!docData) throw new Error("Doctor not found");
    if (!docData.available) throw new Error("Doctor not available");
    if (!docData.fees) throw new Error("Doctor fees not found");

    // Ensure slots_booked is an object
    if (!docData.slots_booked || Array.isArray(docData.slots_booked)) {
      docData.slots_booked = {};
    }
    if (!docData.slots_booked[slotDate]) {
      docData.slots_booked[slotDate] = [];
    }

    const formattedSlotTime = new Date(slotTime).toISOString();
    const slotDatePart = formattedSlotTime.split("T")[0];
    const slotTimePart = new Date(formattedSlotTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const isSlotBooked = docData.slots_booked[slotDate].some(
      (slot: any) => slot.date === slotDatePart && slot.time === slotTimePart
    );
    if (isSlotBooked) {
      throw new Error("Slot not available");
    }

    // Add new slot
    docData.slots_booked[slotDate].push({
      date: slotDatePart,
      time: slotTimePart,
    });
    docData.markModified("slots_booked");
    await this.doctorRepository.updateDoctor(String(docData._id), {
      slots_booked: docData.slots_booked,
    });

    const userData = await this.userRepository.findById(userId);
    if (!userData) throw new Error("User not found");

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

    await this.appointmentRepository.createAppointment(appointmentData);

    try {
      await sendAppointmentBookedEmail(
        userData.email,
        userData.name,
        slotDatePart,
        slotTimePart
      );
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }

    return "Appointment booked successfully";
  }

  async listAppointments(userId: string) {
    return await this.appointmentRepository.findAppointmentsByUserId(userId);
  }

  async cancelAppointment(
    userId: string,
    appointmentId: string
  ): Promise<string> {
    const appointmentData = await this.appointmentRepository.findById(appointmentId);
    if (!appointmentData) {
      throw new Error("Appointment not found");
    }
    if (appointmentData.userId.toString() !== userId) {
      throw new Error("Unauthorized action");
    }

    await this.appointmentRepository.updateAppointment(appointmentId, {
      cancelled: true,
    });

    if (appointmentData.payment) {
      await this.userRepository.updateUser(userId, {
        $inc: { walletBalance: appointmentData.amount },
      });
    }

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
