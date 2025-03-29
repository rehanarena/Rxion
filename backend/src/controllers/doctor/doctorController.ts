import { NextFunction, Request, Response } from "express";
import { DoctorService } from '../../services/doctor/DoctorService';
import specialityModel from "../../models/specialityModel";
import HttpStatus from "../../utils/statusCode";
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const doctorService = new DoctorService();
const backendUrl = process.env.NODE_ENV==="PRODUCTION"? process.env.PRODUCTION_URL_BACKEND: process.env.PRODUCTION_DEV_BACKEND


const loginDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await doctorService.loginDoctor(email, password);
    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const doctorForgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await doctorService.doctorForgotPasswordOTP(email);
    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    console.error(error);
    const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    res.status(status).json({ success: false, message: error.message || "Server error" });
  }
};

export const verifyDoctorOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp, doctorId } = req.body;
    const result = await doctorService.verifyDoctorOtp(doctorId, otp);
    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong." });
  }
};

export const resendDoctorOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.body;
    const result = await doctorService.resendDoctorOtp(doctorId);
    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
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
      res.status(HttpStatus.BAD_REQUEST).json(result);
    } else {
      res.status(HttpStatus.OK).json(result);
    }
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
  }
};

const doctorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    if (!docId) {
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "docId is required" });
      return;
    }
    
    const dashData = await doctorService.getDashboardData(docId);
    res.status(HttpStatus.OK).json({ success: true, dashData });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

const changeAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    const newAvailability = await doctorService.changeAvailability(docId);
    res.status(HttpStatus.OK).json({ success: true, message: "Availability Changed", available: newAvailability });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Doctor not found") {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: error.message });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error while changing availability." });
    }
  }
};

const doctorList = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await doctorService.listDoctors();
    res.status(HttpStatus.OK).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching doctors.",
    });
  }
};

export const getSpeciality = async (req: Request, res: Response): Promise<void> => {
  try {
    const specialties = await specialityModel.find({});
    res.status(HttpStatus.OK).json({ success: true, specialties });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Unable to fetch specialties" });
  }
};

export const doctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    const profileData = await doctorService.getDoctorProfile(docId);
    res.status(HttpStatus.OK).json({ success: true, profileData });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const updateDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, fees, address, available } = req.body;
    const updatedDoctor = await doctorService.updateDoctorProfile(docId, { fees, address, available });
    res.status(HttpStatus.OK).json({ success: true, message: "Profile Updated", updatedDoctor });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Doctor ID is required") {
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
    } else if (error.message === "Doctor not found") {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: error.message });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error while updating profile." });
    }
  }
};

const fileUploadofDoc = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.file) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image", 
        });

        // const imageUrl = result.secure_url;
        // const fileData = {
        //   url: imageUrl,
        //   type: image.mimetype,
        //   fileName: image.originalname,
        // };
  
        const fileData = {
          url: result.secure_url,
          type: req.file.mimetype,        
          fileName: result.original_filename || req.file.originalname,
        };

        res.status(HttpStatus.OK).json({ file: fileData });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "File upload failed." });
  }
  }

export {
  loginDoctor,
  doctorDashboard,
  changeAvailability,
  doctorList,
  fileUploadofDoc
};
