import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appoinmentModel";
import Slot from "../models/slotModel";
import { RRule } from "rrule";
import moment from "moment-timezone";

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


const addSlots = async (req: Request, res: Response): Promise<void> => {
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

    // Validate required fields
    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new Error("Days of week are required.");
    }
    if (!startTime || !endTime) {
      throw new Error("Start and End times are required.");
    }

    // If break times are provided, validate them
    const hasBreak = breakStartTime && breakEndTime;
    if (hasBreak) {
      if (breakStartTime <= startTime || breakEndTime >= endTime) {
        throw new Error("Break times must be between start time and end time.");
      }
    }

    // Create recurrence rule using RRule
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
    const now = new Date();

    // Helper function to build IST formatted datetime string
    const createISTDateTime = (baseDate: Date, timeStr: string): string => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(baseDate);
      newDate.setHours(hours, minutes, 0, 0);
      return moment(newDate).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    };

    // Process each recurrence date
    for (const date of slotDates) {
      const baseDate = new Date(date);

      // If no break times are provided, create one slot per day
      if (!hasBreak) {
        const fullStart = createISTDateTime(baseDate, startTime);
        const fullEnd = createISTDateTime(baseDate, endTime);

        // Skip if the slot's start is in the past
        if (new Date(fullStart) < now) continue;

        // Only add if a slot with these times does not already exist
        const existingSlot = await Slot.findOne({ doctorId, startTime: fullStart, endTime: fullEnd });
        if (!existingSlot && new Date(fullStart) < new Date(fullEnd)) {
          slotsToSave.push({
            doctorId,
            date: fullStart, // You may adjust how you store the date portion
            startTime: fullStart,
            endTime: fullEnd,
            isBooked: false,
          });
        }
      } else {
        // When break times are provided, create two sessions: morning and afternoon

        // -- Morning Session: startTime -> breakStartTime
        const morningStart = createISTDateTime(baseDate, startTime);
        const morningEnd = createISTDateTime(baseDate, breakStartTime);
        if (new Date(morningStart) < now) {
          // If morning session is in the past, skip it.
        } else if (new Date(morningStart) < new Date(morningEnd)) {
          const existingMorningSlot = await Slot.findOne({ doctorId, startTime: morningStart, endTime: morningEnd });
          if (!existingMorningSlot) {
            slotsToSave.push({
              doctorId,
              date: morningStart,
              startTime: morningStart,
              endTime: morningEnd,
              isBooked: false,
            });
          }
        }

        // -- Afternoon Session: breakEndTime -> endTime
        const afternoonStart = createISTDateTime(baseDate, breakEndTime);
        const afternoonEnd = createISTDateTime(baseDate, endTime);
        if (new Date(afternoonStart) < now) {
          // If afternoon session is in the past, skip it.
        } else if (new Date(afternoonStart) < new Date(afternoonEnd)) {
          const existingAfternoonSlot = await Slot.findOne({ doctorId, startTime: afternoonStart, endTime: afternoonEnd });
          if (!existingAfternoonSlot) {
            slotsToSave.push({
              doctorId,
              date: afternoonStart,
              startTime: afternoonStart,
              endTime: afternoonEnd,
              isBooked: false,
            });
          }
        }
      }
    }

    if (slotsToSave.length > 0) {
      await Slot.insertMany(slotsToSave);
      res.json({ 
        success: true, 
        message: 'Slots added successfully!',
        slotsAdded: slotsToSave.length
      });
    } else {
      res.json({ 
        success: false, 
        message: 'No new slots were added. Either the slots already exist or the selected dates are in the past.' 
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
  addSlots,
  // getAvailableSlots,
  appoinmentsDoctor,
  appoinmentComplete,
  appoinmentCancel,
};