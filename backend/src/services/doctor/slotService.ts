import { ISlotService } from "../../interfaces/Service/ISlotService";
import { SlotRepository } from "../../repositories/doctor/slotRepository";
import { RRule } from "rrule";
import moment from "moment";
import { ISlot } from "../../models/slotModel";
import { SlotData } from "../../interfaces/Slot/slot";

export class SlotService implements ISlotService {
  private slotRepository: SlotRepository;

  constructor(slotRepository: SlotRepository) {
    this.slotRepository = slotRepository;
  }

  async getAvailableSlots(doctorId: string): Promise<ISlot[]> {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 30);
    const minStartTime = currentTime.toISOString();
    return this.slotRepository.getAvailableSlots(doctorId, minStartTime);
  }

  async addSlots(data: {
  doctorId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
}): Promise<{ message: string }> {
  const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } = data;

  if (!startDate || !endDate) {
    throw new Error("Start and End dates are required.");
  }

  if (!daysOfWeek || daysOfWeek.length === 0) {
    throw new Error("Days of the week are required.");
  }

  if (!startTime || !endTime) {
    throw new Error("Start and End times are required.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (end < start) {
    throw new Error("End date cannot be before start date.");
  }

  // Create rule for recurrence
  const rule = new RRule({
    freq: RRule.WEEKLY,
    dtstart: start,
    until: end,
    byweekday: daysOfWeek.map(day => {
      switch (day.toUpperCase()) {
        case "MO": return RRule.MO;
        case "TU": return RRule.TU;
        case "WE": return RRule.WE;
        case "TH": return RRule.TH;
        case "FR": return RRule.FR;
        case "SA": return RRule.SA;
        case "SU": return RRule.SU;
        default: throw new Error(`Invalid day: ${day}`);
      }
    }),
  });

  const slotDates = rule.all();
  const slotsToSave: SlotData[] = [];
  let skippedSlots = 0;

  for (const date of slotDates) {
    const startSlotTime = new Date(date);
    const endSlotTime = new Date(date);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    startSlotTime.setHours(startHour, startMinute, 0);
    endSlotTime.setHours(endHour, endMinute, 0);

    if (isNaN(startSlotTime.getTime()) || isNaN(endSlotTime.getTime())) {
      throw new Error("Invalid start or end time.");
    }

    if (startSlotTime < now) {
      // Check if it's today with past time
      if (startSlotTime.toDateString() === now.toDateString()) {
        throw new Error("Past time cannot be selected for today's date.");
      }
      skippedSlots++;
      continue;
    }

    // Validate selected day matches the date's actual weekday
    const weekdayIndex = startSlotTime.getDay(); // 0 (Sun) to 6 (Sat)
    const selectedDay = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][weekdayIndex];
    if (!daysOfWeek.includes(selectedDay)) {
      throw new Error(`Selected day does not match date (${startSlotTime.toDateString()}).`);
    }

    const istStartTime = moment(startSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const istEndTime = moment(endSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    const existingSlot = await this.slotRepository.findSlotByDoctorAndDate(doctorId, istStartTime);
    if (existingSlot) {
      skippedSlots++;
      continue;
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
    await this.slotRepository.insertSlots(slotsToSave);
    let msg = `Slots added successfully!`;
    if (skippedSlots > 0) {
      msg += ` ${skippedSlots} slot(s) skipped (either past or already exist).`;
    }
    return { message: msg };
  } else {
    throw new Error("All selected slots are either in the past or already exist.");
  }
}


  async getSlotsByDoctor(doctorId: string): Promise<ISlot[]> {
    return this.slotRepository.getSlotsByDoctor(doctorId);
  }

  async deleteSlot(slotId: string): Promise<void> {
    const deletedSlot = await this.slotRepository.deleteSlot(slotId);
    if (!deletedSlot) {
      throw new Error("Slot not found");
    }
  }

  async editSlot(
    slotId: string,
    updateData: { startTime: string; endTime: string }
  ): Promise<ISlot> {
    const updatedSlot = await this.slotRepository.updateSlot(slotId, updateData);
    if (!updatedSlot) {
      throw new Error("Slot not found");
    }
    return updatedSlot;
  }
}
