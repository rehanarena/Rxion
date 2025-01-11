import express from 'express';
import { registerUser, verifyOtp, loginUser, resendOtp, forgotPassword, resetPassword, refreshAccessToken, bookAppointment} from '../controllers/userController';
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




export default userRouter;
