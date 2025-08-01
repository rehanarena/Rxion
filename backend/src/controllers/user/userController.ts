import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "../../middlewares/authUser";
import HttpStatus from "../../utils/statusCode";
import dotenv from "dotenv";
import specialityModel from "../../models/specialityModel";
import fs from "fs";
import { s3Client } from "../../config/s3Config";
import {
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UpdateProfileRequestBody } from "../../interfaces/User/user";
import { IUserService } from "../../interfaces/Service/IUserService";
import { IAppointmentService } from "../../interfaces/Service/IAppointmentService";
import { IPaymentService } from "../../interfaces/Service/IPaymentService";

dotenv.config();

interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export class UserController {
  constructor(
    private userService: IUserService,
    private appointmentService: IAppointmentService,
    private paymentService: IPaymentService
  ) {}

  /// Change Password ///
  async changePassword(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, currentPassword, newPassword, confirmPassword } =
        req.body;
      const message = await this.userService.changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword
      );
      res.status(HttpStatus.OK).json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }
  /// Get Profile ///
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.body;
      const userData = await this.userService.getProfile(userId);
      res.status(HttpStatus.OK).json({ success: true, userData });
    } catch (error) {
      next(error);
    }
  }
  /// Update Profile ///
  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, name, phone, address, dob, gender, medicalHistory } =
        req.body as UpdateProfileRequestBody;
      const imageFile = req.file;
      const result = await this.userService.updateProfile(
        userId,
        name,
        phone,
        address,
        dob,
        gender,
        imageFile,
        medicalHistory
      );
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
  async getSpecialty(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const specialties = await specialityModel.find({});
      res.status(200).json({ specialties });
    } catch (error) {
      next(error);
    }
  }
  /// Get Wallet Balance ///
  async getWalletBalance(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id || req.body.userId;
      if (!userId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: "User not authenticated" });
        return;
      }

      const walletBalance = await this.userService.getWalletBalance(userId);
      res.status(HttpStatus.OK).json({ success: true, walletBalance });
    } catch (error) {
      next(error);
    }
  }

  /// Doctor Search ///
  async doctorSearch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { speciality, search, sortBy, page, limit } = req.query;
      const result = await this.userService.searchDoctors({
        speciality: speciality as string,
        search: search as string,
        sortBy: sortBy as string,
        page: page as string,
        limit: limit as string,
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  /// Book Appointment ///
  async bookAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { docId, slotDate, slotTime } = req.body;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }
      const message = await this.appointmentService.bookAppointment(
        token,
        docId,
        slotDate,
        slotTime
      );
      res.status(HttpStatus.CREATED).json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }

  /// List Appointments ///
  async listAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.body;
      const appointments = await this.appointmentService.listAppointments(
        userId
      );
      res.status(HttpStatus.OK).json({ success: true, appointments });
    } catch (error) {
      next(error);
    }
  }

  /// Cancel Appointment ///
  async cancelAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, appointmentId } = req.body;
      const message = await this.appointmentService.cancelAppointment(
        userId,
        appointmentId
      );
      res.status(HttpStatus.OK).json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }
  /// Payment Razorpay ///
  async paymentRazorpay(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { appointmentId } = req.body;
      const result = await this.paymentService.processPayment(appointmentId);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
  /// Verify Payment ///
  async verifyRazorpay(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { razorpay_payment_id, razorpay_order_id } = req.body;
      const result = await this.paymentService.verifyPayment(
        razorpay_payment_id,
        razorpay_order_id
      );
      if (result.message === "Already paid") {
        res.status(409).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async fileUploadofuser(
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

      const putCmd = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: uniqueFileName,
        Body: fileStream,
        ContentType: req.file.mimetype,
      });
      await s3Client.send(putCmd);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting local file:", err);
      });
      const getCmd = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: uniqueFileName,
      });
      const signedUrl = await getSignedUrl(s3Client, getCmd, {
        expiresIn: 60 * 60, 
      });

      res.status(HttpStatus.OK).json({
        file: {
          url: signedUrl,
          type: req.file.mimetype,
          fileName: req.file.originalname,
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      next(error);
    }
  }
}
