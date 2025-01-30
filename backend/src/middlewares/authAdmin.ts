import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
  headers: {
    atoken?: string;
    [key: string]: any;  
  };
}

const authAdmin = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
       res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again.",
      });
      return
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET as string) as JwtPayload;

    const isValid =
      `${process.env.ADMIN_EMAIL}${process.env.ADMIN_PASSWORD}` ===
      `${token_decode.email}${token_decode.password}`;

    if (!isValid) {
      res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again.",
      })
      return;
    }

    next();
  } catch (error: any) {
    console.error("Authentication Error:", error.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authAdmin;
