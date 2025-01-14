import express from 'express';
import { registerUser, verifyOtp, loginUser, resendOtp, forgotPassword, resetPassword, refreshAccessToken, bookAppointment, listAppointments, cancelAppointment, paymentRazorpay, verifyRazorpay} from '../controllers/userController';
import authUser from '../middlewares/authUser';


const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post("/verify-otp",verifyOtp)
userRouter.post("/resend-otp",resendOtp)
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token",refreshAccessToken);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/book-appointment',authUser,bookAppointment);
userRouter.get('/appointments',authUser,listAppointments);
userRouter.post('/cancel-appointment',authUser,cancelAppointment);
userRouter.post('/payment-razorpay',authUser,paymentRazorpay)
userRouter.post('/verify-razorpay',authUser,verifyRazorpay)




export default userRouter;
