import { UserRepository } from "../../repositories/user/UserRepository";
import { AppointmentRepository } from "../../repositories/user/AppointmentRepository";
import { razorpayInstance } from "../../config/razorpay";

interface RazorpayOrderCreateRequestBody {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture?: number;
}

class PaymentService {
  private appointmentRepository: AppointmentRepository;
  private userRepository: UserRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.userRepository = new UserRepository();
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

export default new PaymentService();
