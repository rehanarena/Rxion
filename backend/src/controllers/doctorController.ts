import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appoinmentModel";
import Slot from "../models/slotModel";
import { RRule } from "rrule";
import moment from "moment";


interface AddSlotsRequestBody {
  doctorId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

interface Doctor {
  _id: string;
  email: string;
  password: string;
  available: boolean;
  isBlocked: boolean;
}

interface SlotRequestBody {
  doctorId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  timeSlots: string[];
  startTime: string;  // Add startTime
  endTime: string;    // Add endTime
}

interface SlotData {
  doctorId: string;
  date: string;
  isBooked: boolean;
  startTime: string;
  endTime: string;
}


const loginDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const doctor: Doctor | null = await doctorModel.findOne({ email });

    if (!doctor) {
      res.json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (doctor.isBlocked) {
      res.json({
        success: false,
        message: "Your account has been blocked by the admin.",
      });
      return;
    }

    const isMatch: boolean = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token: string = jwt.sign(
        { id: doctor._id },
        process.env.JWT_SECRET as string
      );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Incorrect password" });
    }
  } catch (error: any) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    let earnings = 0;
    let patients = 0;
    let appointments = 0;

    const dashData = {
      earnings,
      appointments,
      patients,
    };
    res.json({ success: true, dashData });
  } catch (error: any) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const changeAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId } = req.body;

    const docData: Doctor | null = await doctorModel.findById(docId);
    if (!docData) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while changeAvailability.",
    });
  }
};
const doctorList = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while fetching doctors.",
    });
  }
};
export const doctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel
      .findById(docId)
      .select("-password");
    res.json({ success: true, profileData });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
export const slot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.params;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 30); 
    // console.log('Current Time:', currentTime.toISOString()); 
    // console.log('docId:', docId);

    const slots = await Slot.find({
      doctorId: docId, // Use doctorId instead of docId
      isBooked: false,
      startTime: { $gte: currentTime.toISOString() }, // Ensure toISOString() format is used
    }).sort({ startTime: 1 });

    // console.log('Fetched slots:', slots);
    res.json({ success: true, slots });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while fetching slots.",
    });
  }
};
/// ADD Slots ///
export const addSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } = req.body;

    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new Error("Days of week are required.");
    }

    if (!startTime || !endTime) {
      throw new Error("Start and End times are required.");
    }

    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: new Date(startDate),
      until: new Date(endDate),
      byweekday: daysOfWeek.map((day: string) => {
        switch (day.toUpperCase()) {
          case 'MO': return RRule.MO;
          case 'TU': return RRule.TU;
          case 'WE': return RRule.WE;
          case 'TH': return RRule.TH;
          case 'FR': return RRule.FR;
          case 'SA': return RRule.SA;
          case 'SU': return RRule.SU;
          default: throw new Error(`Invalid day: ${day}`);
        }
      }),
    });

    const slotDates = rule.all();

    const slotsToSave: SlotData[] = [];

    for (const date of slotDates) {
      const startSlotTime = new Date(date);
      const endSlotTime = new Date(date);

      startSlotTime.setHours(parseInt(startTime.split(':')[0]));
      startSlotTime.setMinutes(parseInt(startTime.split(':')[1]));

      endSlotTime.setHours(parseInt(endTime.split(':')[0]));
      endSlotTime.setMinutes(parseInt(endTime.split(':')[1]));

      // Ensure valid date
      if (isNaN(startSlotTime.getTime()) || isNaN(endSlotTime.getTime())) {
        throw new Error("Invalid time values.");
      }

      const istStartTime = moment(startSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
      const istEndTime = moment(endSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

      // Check if slot already exists
      const existingSlot = await Slot.findOne({ doctorId, date: istStartTime });
      if (existingSlot) {
        continue; // Skip this slot if it already exists
      }

      slotsToSave.push({
        doctorId,
        date: istStartTime,
        startTime: istStartTime,
        endTime: istEndTime,
        isBooked: false,
      });
    }

    if (slotsToSave.length > 0) {
      await Slot.insertMany(slotsToSave);
      res.json({ success: true, message: 'Slots added successfully!' });
    } else {
      res.json({ success: false, message: 'No new slots to add (they may already exist).' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};


/// getSlots ///
export const getSlotsByDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params; // Get doctorId from the URL params

    const slots = await Slot.find({ doctorId });

    res.json({ success: true, slots });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
/// delete Slot ///
export const deleteSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId } = req.params;

    const deletedSlot = await Slot.findByIdAndDelete(slotId);

    if (!deletedSlot) {
      throw new Error("Slot not found");
    }

    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
/// edit slot ///
export const editSlot = async(req:Request, res:Response): Promise<void> =>{
  const { startTime, endTime } = req.body;
  const { slotId } = req.params;

  try {
    // Find the slot by ID and update it
    const updatedSlot = await Slot.findByIdAndUpdate(
      slotId,
      { startTime, endTime },
      { new: true }  // Return the updated slot
    );

    if (!updatedSlot) {
       res.status(404).json({ message: 'Slot not found' });
       return
    }

    // Return the updated slot
    res.json({
      message: 'Slot updated successfully',
      slot: updatedSlot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

/// appoinments ///
const appoinmentsDoctor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while fetching appoinments.",
    });
  }
};
/// appointment complete ///
const appoinmentComplete = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      res.json({ success: true, message: "Appointment Completed" });
      return;
    } else {
      res.json({ success: false, message: "Mark Failed" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while complete appoinments.",
    });
  }
};

/// appointment Cancel ///
const appoinmentCancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      res.json({ success: true, message: "Appointment Cancelled" });
      return;
    } else {
      res.json({ success: false, message: "cancellation Failed" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error while complete appoinments.",
    });
  }
};

export {
  loginDoctor,
  doctorDashboard,
  changeAvailability,
  doctorList,
  appoinmentsDoctor,
  appoinmentComplete,
  appoinmentCancel,
};