 import { Request, Response } from 'express';
 import bcrypt from 'bcrypt';
 import jwt from 'jsonwebtoken';
 import doctorModel  from '../models/doctorModel';
 interface Doctor {
   _id: string;
   email: string;
   password: string;
   available:boolean;
   isBlocked:boolean;
 }


 const loginDoctor = async (req: Request, res: Response): Promise<void> => {
   try {
     const { email, password }: { email: string, password: string } = req.body;
    
     const doctor: Doctor | null = await doctorModel.findOne({ email });
    
     if (!doctor) {
       res.json({ success: false, message: "Invalid credentials" });
       return;
     }

     if (doctor.isBlocked) {
      res.json({ success: false, message: "Your account has been blocked by the admin." });
      return
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

 const changeAvailability = async (req: Request, res: Response): Promise<void> =>{
  try {
    const {docId} = req.body;

    const docData: Doctor|null = await doctorModel.findById(docId)
    if (!docData) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
    res.json({success:true,message:'Availability Changed'})

  } catch (error) {
    console.log(error)
    res.json({success:false, message: "Server error while changeAvailability." })
  }
 }

 const doctorList = async(req: Request, res: Response): Promise<void> =>{
  try {
    const doctors = await doctorModel.find({}).select(['-password','-email'])
    res.json({success:true,doctors})
  } catch (error) {
    console.log(error)
    res.json({success:false, message: "Server error while fetching doctors." })
  }
 }

 export { loginDoctor, doctorDashboard,changeAvailability,doctorList };



