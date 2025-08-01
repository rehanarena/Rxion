import { NextFunction, Request, Response } from "express";
import { IDoctorService } from "../../interfaces/Service/IDoctorService";
import specialityModel from "../../models/specialityModel";
import HttpStatus from "../../utils/statusCode";
import fs from "fs";
import { s3Client } from "../../config/s3Config";
import {
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

export class DoctorController {
  private doctorService: IDoctorService;

  constructor(doctorService: IDoctorService) {
    this.doctorService = doctorService;
  }

  async loginDoctor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.doctorService.loginDoctor(email, password);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async doctorForgotPasswordOTP(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.doctorService.doctorForgotPasswordOTP(email);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyDoctorOtp(req: Request, res: Response): Promise<void> {
    try {
      const { otp, doctorId } = req.body;
      const result = await this.doctorService.verifyDoctorOtp(doctorId, otp);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Something went wrong." });
    }
  }

  async resendDoctorOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { doctorId } = req.body;
      const result = await this.doctorService.resendDoctorOtp(doctorId);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async doctorResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, token, password } = req.body;
      const result = await this.doctorService.doctorResetPassword(
        email,
        token,
        password
      );
      if (!result.success) {
        res.status(HttpStatus.BAD_REQUEST).json(result);
      } else {
        res.status(HttpStatus.OK).json(result);
      }
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Server error" });
    }
  }

  async changeDoctorPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { doctorId, currentPassword, newPassword, confirmPassword } =
        req.body;
      const message = await this.doctorService.changeDoctorPassword(
        doctorId,
        currentPassword,
        newPassword,
        confirmPassword
      );
      res.status(HttpStatus.OK).json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }

  async doctorDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { docId } = req.body;
      if (!docId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "docId is required" });
        return;
      }

      const dashData = await this.doctorService.getDashboardData(docId);
      res.status(HttpStatus.OK).json({ success: true, dashData });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async changeAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { docId } = req.body;
      const newAvailability = await this.doctorService.changeAvailability(
        docId
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Availability Changed",
        available: newAvailability,
      });
    } catch (error) {
      next(error);
    }
  }

  async doctorList(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this.doctorService.listDoctors();
      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Server error while fetching doctors.",
      });
    }
  }

  async getSpeciality(req: Request, res: Response): Promise<void> {
    try {
      const specialties = await specialityModel.find({});
      res.status(HttpStatus.OK).json({ success: true, specialties });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Unable to fetch specialties" });
    }
  }

  async doctorProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { docId } = req.body;
      const profileData = await this.doctorService.getDoctorProfile(docId);
      res.status(HttpStatus.OK).json({ success: true, profileData });
    } catch (error) {
      next(error);
    }
  }

  async updateDoctorProfile(req: Request, res: Response): Promise<void> {
    try {
      const { docId, fees, address, available, experience, about } = req.body;
      // console.log("Received update:", req.body);
      const updatedDoctor = await this.doctorService.updateDoctorProfile(
        docId,
        { fees, address, available, experience, about }
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Profile Updated",
        updatedDoctor,
      });
    } catch (error) {
      console.error("Error in updateDoctorProfile controller:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Server error while updating profile.",
      });
    }
  }

  async fileUploadofDoc(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.file) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: "No file uploaded" });
      return;
    }
  
    try {
      const filePath = req.file.path;
      const fileStream = fs.createReadStream(filePath);
      const uniqueFileName = `${Date.now()}-${req.file.originalname}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: uniqueFileName,
        Body: fileStream,
        ContentType: req.file.mimetype,
      });
  
      await s3Client.send(uploadCommand);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting local file:", err);
        }
      });

      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: uniqueFileName,
      });
  
      const signedUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 60 * 60, 
      });
  
      const fileData = {
        url: signedUrl,
        type: req.file.mimetype,
        fileName: req.file.originalname,
      };
  
      res.status(HttpStatus.OK).json({ file: fileData });
    } catch (error) {
      console.error("Error uploading file:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "File upload failed." });
    }
}
}
