import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from "dotenv";
dotenv.config();


const secretKey = process.env.JWT_SECRET as string;
interface RequestWithUser extends Request {
  body: {
    docId?: string;
  };
}

const authDoctor = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dToken = req.headers.authorization?.split(' ')[1] as string;

    console.log(dToken)
    
    if (!dToken) {
      res.json({ success: false, message: "Not Authorized. Please log in again." });
      return;
    }

     const token_decode = jwt.verify(dToken, secretKey) as JwtPayload;
       console.log("Decoded Token:", token_decode);
        req.body.docId = token_decode.id;

    next();
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
