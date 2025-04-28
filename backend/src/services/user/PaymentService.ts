import { IPaymentService } from "../../interfaces/Service/IPaymentService";
import { IAppointmentRepository } from "../../interfaces/Repository/IAppointmentRepository";
import { IUserRepository } from "../../interfaces/Repository/IUserRepository";
import { razorpayInstance } from "../../config/razorpay";
import { RazorpayOrderCreateRequestBody } from "../../interfaces/User/user";

export class PaymentService implements IPaymentService {
  private appointmentRepository: IAppointmentRepository;
  private userRepository: IUserRepository;

  constructor(
    appointmentRepository: IAppointmentRepository,
    userRepository: IUserRepository
  ) {
    this.appointmentRepository = appointmentRepository;
    this.userRepository = userRepository;
  }

  async processPayment(appointmentId: string) {
    const appointment = await this.appointmentRepository.findById(
      appointmentId
    );
    if (!appointment || appointment.cancelled) {
      throw new Error("Appointment cancelled or not found");
    }

    const user = await this.userRepository.findById(
      appointment.userId.toString()
    );
    if (!user) {
      throw new Error("User not found");
    }

    let walletUsed = 0;
    let remainingAmount = appointment.amount;

    if (user.walletBalance > 0) {
      if (user.walletBalance >= appointment.amount) {
        walletUsed = appointment.amount;
        remainingAmount = 0;

        await this.userRepository.updateWallet(user._id as string, {
          $inc: { walletBalance: -appointment.amount },
        });
        await this.appointmentRepository.updatePaymentStatus(appointmentId, {
          payment: true,
          walletUsed,
        });
        return { success: true, message: "Payment completed using wallet" };
      } else {
        walletUsed = user.walletBalance;
        remainingAmount = appointment.amount - user.walletBalance;
        await this.userRepository.updateWallet(user._id as string, {
          walletBalance: 0,
        });
        await this.appointmentRepository.updatePaymentStatus(appointmentId, {
          walletUsed,
        });
      }
    }

    if (remainingAmount > 0) {
      const currency = process.env.CURRENCY || "INR";
      const options: RazorpayOrderCreateRequestBody = {
        amount: remainingAmount * 100,
        currency: currency,
        receipt: appointmentId.toString(),
        payment_capture: 1,
      };

      const order = await razorpayInstance.orders.create(options);
      return { success: true, order };
    }

    throw new Error("Unexpected error in payment processing");
  }

  async verifyPayment(razorpay_payment_id: string, razorpay_order_id: string) {
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const appointment = await this.appointmentRepository.findOne({
        _id: orderInfo.receipt,
      });
      if (appointment && appointment.payment) {
        return { success: false, message: "Already paid" };
      }
      await this.appointmentRepository.updatePaymentStatus(
        orderInfo.receipt as string,
        { payment: true }
      );
      return { success: true, message: "Payment Successful" };
    } else {
      return { success: false, message: "Payment Failed" };
    }
  }
}
