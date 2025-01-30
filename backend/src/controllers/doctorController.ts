 import { Request, Response } from 'express';
 import bcrypt from 'bcrypt';
 import jwt from 'jsonwebtoken';
 import doctorModel  from '../models/doctorModel';
import appointmentModel from '../models/appoinmentModel';
import { RRule } from 'rrule';
 interface Doctor {
   _id: string;
   email: string;
   password: string;
   available:boolean;
   isBlocked:boolean;
 }

 type AvailableSlot = {
  startTime: string;
  endTime: string;
};

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
 export const addSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.params; // docId from the URL parameter
    const { type, date, day, time, endTime } = req.body; // Slot details from the request body

    if (!docId || (!date && !day) || !time) {
      res.status(400).json({ success: false, message: "Invalid slot data" });
      return;
    }

    // Find the doctor by docId
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    // Add the slot to the doctor document
    if (type === 'specific' && date && time) {
      // Adding a specific date and time slot
      doctor.slots.push({ slotDate: date, slotTime: time });
    } else if (type === 'recurring' && day && time && endTime) {
      // Adding a recurring slot
      doctor.availableSlots[day] = doctor.availableSlots[day] || [];
      doctor.availableSlots[day].push({ startTime: time, endTime });
    }

    // Save the updated doctor document
    await doctor.save();

    console.log("Updated Doctor:", doctor);
    res.status(200).json({ success: true, message: "Slot added successfully" });
  } catch (error) {
    console.error("Error adding slot:", error);
    res.status(500).json({ success: false, message: "Failed to add slot" });
  }
};
// Get available slots for a doctor
export const getSlot = async (req: Request, res: Response): Promise<void> => {
  const { docId } = req.params;
  const { date } = req.query;

  console.log('Received doctorId:', docId, 'Requested Date:', date);

  // Find doctor by doctorId
  const doctor = await doctorModel.findById(docId);
  if (!doctor) {
    res.status(404).json({ success: false, message: "Doctor not found" });
    return;
  }

  // Initialize availableSlots as an empty array of AvailableSlot
  let availableSlots: AvailableSlot[] = []; // Change to AvailableSlot[] instead of string[]

  // Check if a date is provided, and filter slots accordingly
  if (date) {
    try {
      const selectedDate = new Date(date as string);
      selectedDate.setHours(0, 0, 0, 0); // Normalize the date to start of day

      // Check if the specific date has slots in availableSlots
      availableSlots = doctor.availableSlots[selectedDate.toISOString().split('T')[0]] || [];
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid date format" });
      return;
    }
  } else {
    // If no date is provided, return all available slots from doctor.availableSlots
    availableSlots = Object.values(doctor.availableSlots).flat();
  }

  // Return available slots (even if empty) with a success response
  res.status(200).json({ success: true, slots: availableSlots });
};





 /// appoinments ///
 const appoinmentsDoctor = async(req: Request, res: Response): Promise<void> =>{
  try {
    const {docId} = req.body
    const appointments = await appointmentModel.find({docId})

    res.json({success:true,appointments})
  } catch (error) {
      console.log(error)
      res.json({success:false, message: "Server error while fetching appoinments." })
  }
 }
  /// appointment complete ///
  const appoinmentComplete = async(req: Request, res: Response): Promise<void> =>{
    try {
      const {docId,appointmentId} =req.body

      const appointmentData = await appointmentModel.findById(appointmentId)
      if (appointmentData && appointmentData.docId === docId) {
        await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})
        res.json({success:true,message:'Appointment Completed'})
        return
      }else{
        res.json({success:false,message:'Mark Failed'})
        return
      }
    } catch (error) {
      console.log(error)
      res.json({success:false, message: "Server error while complete appoinments." })
  }
  }

  /// appointment Cancel ///
  const appoinmentCancel = async(req: Request, res: Response): Promise<void> =>{
    try {
      const {docId,appointmentId} =req.body

      const appointmentData = await appointmentModel.findById(appointmentId)
      if (appointmentData && appointmentData.docId === docId) {
        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
        res.json({success:true,message:'Appointment Cancelled'})
        return
      }else{
        res.json({success:false,message:'cancellation Failed'})
        return
      }
    } catch (error) {
      console.log(error)
      res.json({success:false, message: "Server error while complete appoinments." })
  }
  }

 export { loginDoctor, doctorDashboard,changeAvailability,doctorList,appoinmentsDoctor,appoinmentComplete,appoinmentCancel };



