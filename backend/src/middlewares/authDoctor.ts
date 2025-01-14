import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Doctor authentication middleware
const authDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
       res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
      return
    }

    // Type assertion to specify the token content structure
    const token_decode = jwt.verify(dtoken as string, process.env.JWT_SECRET as string) as { id: string };

    req.body.docId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'Internal Error' });
  }
};

export default authDoctor;
