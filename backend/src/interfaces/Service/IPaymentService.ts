export interface IPaymentService {
    processPayment(appointmentId: string): Promise<any>;
    verifyPayment(razorpay_payment_id: string, razorpay_order_id: string): Promise<any>;
  }
  