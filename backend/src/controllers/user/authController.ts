import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import HttpStatus from "../../utils/statusCode";
import { AuthService } from "../../services/user/auth";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authService.registerUser(req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        userId: user._id,
        message: "OTP sent to email. Please verify.",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { otp, userId } = req.body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid userId." });
      return;
    }

    try {
      const result = await this.authService.verifyOtp(otp, userId);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId } = req.body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid userId." });
      return;
    }
  
    try {
      
      const result = await this.authService.resendOtp(userId);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await this.authService.loginUser(email, password);
      res.status(HttpStatus.OK).json({
        success: true,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };



  async google(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, photo } = req.body;
  
      if (!name || !email || !photo) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Name, email, and photo are required" });
        return;
      }

      const { status, user, token } = await this.authService.googleAuth(email, name, photo);
  
      const userObject = user.toObject ? user.toObject() : user;
      const { password, ...rest } = userObject;
  
      if (status === HttpStatus.OK) {
        const expiryDate = new Date(Date.now() + 3600000);
        res
          .cookie("access_token", token, {
            httpOnly: true,
            expires: expiryDate,
          })
          .status(HttpStatus.OK)
          .json({
            success: true,
            message: "Login successful",
            user: rest,
            accessToken: token,
          });
      } else {
        res.status(HttpStatus.CREATED).json({
          message: "Account created",
          user: rest,
          accessToken: token,
        });
      }
    } catch (error) {
      next(error);
    }
  };
  async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>{
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "No refresh token provided" });
      return;
    }
  
    try {
      const newAccessToken = await this.authService.refreshAccessToken(refreshToken);
      res.status(HttpStatus.OK).json({ success: true, accessToken: newAccessToken });
    } catch (error) {
      next(error);
    }
  };
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>{
    try {
      const { email } = req.body;
      const result = await this.authService.forgotPassword(email);
      console.log("forgotPassword result:", result);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
 async resetPassword(req: Request, res: Response,next: NextFunction): Promise<void>{
    try {
      const { email, token, password } = req.body;
      const result = await  this.authService.userResetPassword(email, token, password);
      if (!result.success) {
        res.status(HttpStatus.BAD_REQUEST).json(result);
      } else {
        res.status(HttpStatus.OK).json(result);
      }
    } catch (error) {
      next(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
  }
  
}
