import { Request, Response } from "express";
import { DoctorService } from '../../services/doctor/DoctorService';

const doctorService = new DoctorService();


const loginDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await doctorService.loginDoctor(email, password);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const doctorForgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await doctorService.doctorForgotPasswordOTP(email);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || "Server error" });
  }
};

export const verifyDoctorOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp, doctorId } = req.body;
    const result = await doctorService.verifyDoctorOtp(doctorId, otp);
    res.json(result);
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

export const resendDoctorOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.body;
    const result = await doctorService.resendDoctorOtp(doctorId);
    res.json(result);
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || "An error occurred while resending the OTP. Please try again later."
    });
  }
};

export const doctorResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token, password } = req.body;
    const result = await doctorService.doctorResetPassword(email, token, password);
    if (!result.success) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




const doctorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    if (!docId) {
      res.status(400).json({ success: false, message: "docId is required" });
      return;
    }
    
    const dashData = await doctorService.getDashboardData(docId);
    res.json({ success: true, dashData });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const changeAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId } = req.body;
    const newAvailability = await doctorService.changeAvailability(docId);
    res.json({ success: true, message: "Availability Changed", available: newAvailability });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Doctor not found") {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Server error while changing availability." });
    }
  }
};

const doctorList = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await doctorService.listDoctors();
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching doctors.",
    });
  }
};

export const doctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    const profileData = await doctorService.getDoctorProfile(docId);
    res.json({ success: true, profileData });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, fees, address, available } = req.body;

    const updatedDoctor = await doctorService.updateDoctorProfile(docId, { fees, address, available });
    res.json({ success: true, message: "Profile Updated", updatedDoctor });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Doctor ID is required") {
      res.status(400).json({ success: false, message: error.message });
    } else if (error.message === "Doctor not found") {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Server error while updating profile." });
    }
  }
};



export {
  loginDoctor,
  doctorDashboard,
  changeAvailability,
  doctorList,
};