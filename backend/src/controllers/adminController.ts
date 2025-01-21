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

    // Send the password to the added doctor's email
    await sendPasswordEmail(email, password);

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

/// manage slot //
export const updateSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, slotDate, slotTime } = req.body;

    // Find the doctor by ID
    const doctor = await doctorModel.findById(doctorId);
    
    // Check if doctor exists
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    // Check if slot is already booked for the given date and time
    const slotExists = doctor.slots_booked.some(
      (slot: { date: string; time: string }) =>
        slot.date === slotDate && slot.time === slotTime
    );

    if (slotExists) {
      res.status(400).json({ success: false, message: "Slot already booked" });
      return;
    }

    // Add the new slot to the doctor's schedule
    doctor.slots_booked.push({ date: slotDate, time: slotTime });
    
    // Save the doctor with the updated slot
    await doctor.save();

    // Send a successful response
    res.status(200).json({ success: true, message: "Slots updated successfully" });

  } catch (error) {
    console.error("Error updating slots:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



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

    // Releasing doctor's slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId) ;

    if (!doctorData) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    let slots_booked = doctorData.slots_booked;
    console.log("Slots booked: ", slots_booked);

    /// Filtering the slotTime from the booked slots ///
    if (slots_booked[slotDate]) {
      console.log("Filtered: ", slots_booked[slotDate].filter((e: string) => e !== slotTime));
      slots_booked[slotDate] = slots_booked[slotDate].filter((e: string) => e !== slotTime);
      console.log("After filtering: ", slots_booked[slotDate]);

      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};






export { addDoctor, loginAdmin, adminDashboard, userList, blockUnblockUser,blockUnblockDoctor, doctorList,allDoctors,appointmentsAdmin, cancelAppointment};
