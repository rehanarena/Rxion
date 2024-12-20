import express from 'express';
import { registerUser, verifyOtp, loginUser, resendOtp, forgotPassword, resetPassword} from '../controllers/userController';


const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post("/verify-otp",verifyOtp)
userRouter.post("/resend-otp",resendOtp)
userRouter.post("/login", loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);



export default userRouter;
