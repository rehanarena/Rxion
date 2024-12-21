import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  body: {
    userId?: string;
  };
}

const authUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.headers;
    
    if (!token) {
      res.json({ success: false, message: "Not Authorized. Please log in again." });
      return;
    }

    const token_decode = jwt.verify(token as string, process.env.JWT_SECRET as string) as JwtPayload;

    req.body.userId = token_decode.id;

    next();
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
