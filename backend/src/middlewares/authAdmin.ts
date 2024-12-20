import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET as string;
const adminEmail = process.env.ADMIN_EMAIL as string;
const adminPassword = process.env.ADMIN_PASSWORD as string;

const authAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const atoken = req.headers.atoken as string;

    if (!atoken) {
      res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
      return;
    }

    const token_decode = jwt.verify(atoken, secretKey) as JwtPayload;
    // console.log("Decoded Token:", token_decode);

    const isValid =
      token_decode.email === adminEmail &&
      token_decode.password === adminPassword;

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
