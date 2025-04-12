"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const userRepository_1 = require("../../repositories/user/userRepository");
const appointmentRepository_1 = require("../../repositories/user/appointmentRepository");
const razorpay_1 = require("../../config/razorpay");
class PaymentService {
    constructor() {
        this.appointmentRepository = new appointmentRepository_1.AppointmentRepository();
        this.userRepository = new userRepository_1.UserRepository();
    }
    processPayment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.appointmentRepository.findById(appointmentId);
            if (!appointment || appointment.cancelled) {
                throw new Error("Appointment cancelled or not found");
            }
            const user = yield this.userRepository.findById(appointment.userId.toString());
            if (!user) {
                throw new Error("User not found");
            }
            let walletUsed = 0;
            let remainingAmount = appointment.amount;
            if (user.walletBalance > 0) {
                if (user.walletBalance >= appointment.amount) {
                    walletUsed = appointment.amount;
                    remainingAmount = 0;
                    yield this.userRepository.updateWallet(user._id, {
                        $inc: { walletBalance: -appointment.amount },
                    });
                    yield this.appointmentRepository.updatePaymentStatus(appointmentId, {
                        payment: true,
                        walletUsed,
                    });
                    return { success: true, message: "Payment completed using wallet" };
                }
                else {
                    walletUsed = user.walletBalance;
                    remainingAmount = appointment.amount - user.walletBalance;
                    yield this.userRepository.updateWallet(user._id, {
                        walletBalance: 0,
                    });
                    yield this.appointmentRepository.updatePaymentStatus(appointmentId, {
                        walletUsed,
                    });
                }
            }
            if (remainingAmount > 0) {
                const currency = process.env.CURRENCY || "INR";
                const options = {
                    amount: remainingAmount * 100,
                    currency: currency,
                    receipt: appointmentId.toString(),
                    payment_capture: 1,
                };
                const order = yield razorpay_1.razorpayInstance.orders.create(options);
                return { success: true, order };
            }
            throw new Error("Unexpected error in payment processing");
        });
    }
    verifyPayment(razorpay_payment_id, razorpay_order_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderInfo = yield razorpay_1.razorpayInstance.orders.fetch(razorpay_order_id);
            if (orderInfo.status === "paid") {
                const appointment = yield this.appointmentRepository.findOne({
                    _id: orderInfo.receipt,
                });
                if (appointment && appointment.payment) {
                    return { success: false, message: "Already paid" };
                }
                yield this.appointmentRepository.updatePaymentStatus(orderInfo.receipt, { payment: true });
                return { success: true, message: "Payment Successful" };
            }
            else {
                return { success: false, message: "Payment Failed" };
            }
        });
    }
}
exports.PaymentService = PaymentService;
