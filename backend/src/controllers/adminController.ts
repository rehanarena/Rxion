import { Request, Response } from "express";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel";
import userModel from "../models/userModel";
import appointmentModel from "../models/appoinmentModel";
import { sendPasswordEmail } from "../helper/mailer";


interface AddDoctorRequestBody {
  name: string;
  email: string;
  password: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: string;
  address: string;
}
export interface IBookedSlot {
  startTime: string;
  isBooked: boolean;
}

const addDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body as AddDoctorRequestBody;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      res.status(400).json({ success: false, message: "Missing Details" });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ success: false, message: "Invalid Email" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: "Weak password" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile!.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      res.status(400).json({ success: false, message: "Invalid address format" });
      return;
    }

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: parsedAddress,
      date: new Date(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    await sendPasswordEmail(email, password);
    console.log("password for the doc:" ,password)

    res.status(201).json({ success: true, message: "Doctor Added Successfully and Password Sent to Email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : "An unexpected error occurred" });
  }
};

/// loginAdmin ///

const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, password }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error instanceof Error ? error.message : "An unexpected error occurred" });
  }
};

/// Dashboard ///
const adminDashboard = async(req: Request,res: Response): Promise<void> =>{
  try {
    const doctors = await doctorModel.find({})
    const users = await userModel.find({})

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
    }
    res.json ({success:true,dashData});

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error instanceof Error ? error.message : "An unexpected error occurred" });
  }
}
const userList = async (req: Request, res:Response): Promise<void>=>{
  try {
    const users = await userModel.find(); 
    // console.log(users);
     res.status(200).json(users); 
     return
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: "Server error while fetching users." });
     return
  }
};
const blockUnblockUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    const user = await userModel.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (action === "block") {
      user.isBlocked = true;
    } else if (action === "unblock") {
      user.isBlocked = false;
    } else {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    await user.save();
    res.status(200).json({ message: `User has been ${action}ed successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const blockUnblockDoctor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    const doctor = await doctorModel.findById(id);

    if (!doctor) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    if (action === "block") {
      doctor.isBlocked = true;
    } else if (action === "unblock") {
      doctor.isBlocked = false;
    } else {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    await doctor.save();
    res.status(200).json({ message: `Doctor has been ${action}ed successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const doctorList = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await doctorModel.find(); 

    res.status(200).json(doctors); 
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server error while fetching doctors." });
  }
}

const allDoctors = async(req: Request, res: Response): Promise<void> =>{
  try {
    const doctors = await doctorModel.find({}).select('-password')
    res.json({success:true,doctors})
  }catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server error while fetching doctors." });
  }
}

export const getDoctors = async(req: Request, res: Response):Promise<void>=>{
  const { doctorId } = req.params;
  try {
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
       res.status(404).json({ success: false, message: "Doctor not found" });
       return
    }
    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/// All appointment list ///
const appointmentsAdmin = async(req: Request, res: Response): Promise<void> =>{

  try {
    const appointments = await appointmentModel.find({})
    res.json({success:true,appointments}) 
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server error while fetching doctors." });
  }
}



/// cancelAppointment ///
const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId }: { appointmentId: string } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId) ;

    if (!appointmentData) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId) ;

    if (!doctorData) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    let slots_booked = doctorData.slots_booked;
    console.log("Slots booked: ", slots_booked);

    if (slots_booked[slotDate]) {
      // Cast slots_booked[slotDate] to the new shape
      const updatedSlots = (slots_booked[slotDate] as Array<{ date: string; time: string }>).filter(
        (slot) => `${slot.date} ${slot.time}` !== slotTime
      );
      slots_booked[slotDate] = updatedSlots;
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }
    

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};






export { addDoctor, loginAdmin, adminDashboard, userList, blockUnblockUser,blockUnblockDoctor, doctorList,allDoctors,appointmentsAdmin, cancelAppointment};