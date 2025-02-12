import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithUser extends Request {
    userId?: string;
}

const authUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.json({ success: false, message: "Not Authorized. Please log in again." });
      return;
    }

    // The token is the second part of the 'Bearer <token>' string
    const token = authHeader.split(' ')[1]; 

    if (!token) {
      res.json({ success: false, message: "Token not found." });
      return;
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    req.body.userId = token_decode.id;

    next();
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


export default authUser;
