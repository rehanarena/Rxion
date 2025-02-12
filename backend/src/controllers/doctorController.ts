import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appoinmentModel";
import Slot from "../models/slotModel";
import { RRule } from "rrule";
import moment from "moment";
import DoctorSchedule from "../models/DoctorSlotModel"
import { generateTimeSlots } from "../helper/timeHelpers";


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





export const addSlots = async (
  req: Request<{}, {}, AddSlotsRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { 
      doctorId, 
      startDate, 
      endDate, 
      daysOfWeek, 
      startTime, 
      endTime,
      breakStartTime,  // optional break start (e.g., "12:00")
      breakEndTime     // optional break end (e.g., "13:00")
    } = req.body;

    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new Error("Days of week are required.");
    }
    if (!startTime || !endTime) {
      throw new Error("Start and End times are required.");
    }

    const hasBreak = breakStartTime && breakEndTime;
    if (hasBreak) {
      if (breakStartTime <= startTime || breakEndTime >= endTime) {
        throw new Error("Break times must be between start time and end time.");
      }
    }

    // Create recurrence rule for dates.
    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: new Date(startDate),
      until: new Date(endDate),
      byweekday: daysOfWeek.map((day) => {
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
    const now = new Date();
    let totalSlotsAdded = 0;

    // Process each recurrence date.
    for (const date of slotDates) {
      const baseDate = new Date(date);
      if (baseDate < now) continue; // Skip past dates

      let sessionSlots: string[] = [];

      // If no break is provided, generate one session.
      if (!hasBreak) {
        sessionSlots = generateTimeSlots(baseDate, startTime, endTime);
      } else {
        // Generate morning session slots.
        const morningSlots = generateTimeSlots(baseDate, startTime, breakStartTime!);
        // Generate afternoon session slots.
        const afternoonSlots = generateTimeSlots(baseDate, breakEndTime!, endTime);
        sessionSlots = [...morningSlots, ...afternoonSlots];
      }

      // Find if a schedule document for this doctor and date already exists.
      let scheduleDoc = await DoctorSchedule.findOne({ doctorId, date: baseDate });
      if (scheduleDoc) {
        // Merge new slots into the existing array (avoid duplicates).
        sessionSlots.forEach((time) => {
          if (!scheduleDoc.timeSlots.some(slot => slot.time === time)) {
            scheduleDoc.timeSlots.push({ time, status: "available" });
            totalSlotsAdded++;
          }
        });
        await scheduleDoc.save();
      } else {
        // Create a new schedule document.
        const timeSlots = sessionSlots.map((time) => ({ time, status: "available" }));
        await DoctorSchedule.create({
          doctorId,
          date: baseDate,
          timeSlots,
        });
        totalSlotsAdded += timeSlots.length;
      }
    }

    if (totalSlotsAdded > 0) {
      res.json({ 
        success: true, 
        message: 'Slots added successfully!',
        slotsAdded: totalSlotsAdded
      });
    } else {
      res.json({ 
        success: false, 
        message: 'No new slots were added. Either they already exist or the selected dates are in the past.' 
      });
    }
  } catch (error: any) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



/// get slots ///
// const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { doctorId } = req.params;

//     // Fetch the available slots for the doctor using the doctorId
//     const slots = await Slot.find({ doctorId: doctorId, isBooked: false });  // Assuming isBooked indicates available slots

//     if (!slots || slots.length === 0) {
//       res.status(404).json({ message: "No available slots found for this doctor" });
//       return
//     }

//     // Return the available slots
//     res.status(200).json({
//       message: "Available slots fetched successfully",
//       doctorId: doctorId,
//       slots: slots,  // Send the actual slots data
//     });
//   } catch (error:any) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching available slots", error: error.message });
//   }
// };

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