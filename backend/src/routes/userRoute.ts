import express from 'express';
import { registerUser, loginUser,verifyOtp} from '../controllers/userController';

const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/verify-otp",verifyOtp)


export default userRouter;
