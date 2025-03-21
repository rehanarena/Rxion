import express from 'express';
import { registerUser, verifyOtp, loginUser, resendOtp, forgotPassword, refreshAccessToken, bookAppointment, listAppointments, cancelAppointment, paymentRazorpay, verifyRazorpay, google, getProfile, updateProfile, doctorSearch, changePassword, getWalletBalance, fileUpload} from '../controllers/userController';
import authUser from '../middlewares/authUser';
import upload from '../middlewares/multer';


const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post("/verify-otp",verifyOtp)
userRouter.post("/resend-otp",resendOtp)
userRouter.post("/login", loginUser);
userRouter.post('/google',google)
userRouter.post("/refresh-token",refreshAccessToken);
userRouter.post('/forgot-password', forgotPassword);
userRouter.put('/change-password', changePassword);
userRouter.get('/get-profile',authUser,getProfile)
userRouter.put('/update-profile',upload.single("image"),authUser,updateProfile);
userRouter.get('/doctors',doctorSearch)
userRouter.post('/book-appointment',authUser,bookAppointment);
userRouter.get('/appointments',authUser,listAppointments);
userRouter.post('/upload',upload.single('file'),fileUpload)
userRouter.post('/cancel-appointment',authUser,cancelAppointment);
userRouter.post('/payment-razorpay',authUser,paymentRazorpay);
userRouter.post('/verify-razorpay',authUser,verifyRazorpay);
userRouter.get('/wallet',authUser,getWalletBalance);





export default userRouter;