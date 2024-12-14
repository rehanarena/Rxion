import express from 'express';
import { registerUser, verifyOtp, loginUser} from '../controllers/userController';


const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post("/verify-otp",verifyOtp)
userRouter.post("/login", loginUser);



export default userRouter;
