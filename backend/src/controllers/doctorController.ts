 import { Request, Response } from 'express';
 import bcrypt from 'bcrypt';
 import jwt from 'jsonwebtoken';
 import doctorModel  from '../models/doctorModel';
import { Console } from 'console';
 interface Doctor {
   _id: string;
   email: string;
   password: string;
 }


 const loginDoctor = async (req: Request, res: Response): Promise<void> => {
   try {
     const { email, password }: { email: string, password: string } = req.body;
    
     const doctor: Doctor | null = await doctorModel.findOne({ email });
    
     if (!doctor) {
       res.json({ success: false, message: "Invalid credentials" });
       return;
     }

     const isMatch: boolean = await bcrypt.compare(password, doctor.password);

     if (isMatch) {
       const token: string = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET as string);
       res.json({ success: true, token });
     } else {
       res.json({ success: false, message: "Incorrect password" });
     }
   } catch (error: any) {
     console.log(error);
     res.json({ success: false, message: error.message });
   }
 };

 const doctorDashboard = async(req: Request, res: Response): Promise<void> =>{
  try {
    let earnings = 0
    let patients = 0
    let appointments = 0

    const dashData = {
      earnings, 
      appointments,
      patients
    }
    res.json({success:true,dashData})

  }  catch (error: any) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
 }

 export { loginDoctor, doctorDashboard };



