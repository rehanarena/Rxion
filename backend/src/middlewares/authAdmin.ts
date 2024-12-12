import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET as string; 

/**
 * Admin authentication middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const authAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const atoken = req.headers.atoken as string;

    if (!atoken) {
      res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
      return;
    }

    const tokenDecode = jwt.verify(atoken, secretKey) as JwtPayload;

    // Validate the decoded token
    const isValid =
      tokenDecode.email === process.env.ADMIN_EMAIL &&
      tokenDecode.password === process.env.ADMIN_PASSWORD;

    if (!isValid) {
      res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error in admin authentication:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export default authAdmin;
