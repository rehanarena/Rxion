import { SlotRepository } from "../../repositories/doctor/slotRepository";
import { RRule } from "rrule";
import moment from "moment";
import { ISlot } from "../../models/slotModel";
import { SlotData } from "../../interfaces/Slot/slot";

export class SlotService {
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
    const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } =
      data;

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
          case "MO":
            return RRule.MO;
          case "TU":
            return RRule.TU;
          case "WE":
            return RRule.WE;
          case "TH":
            return RRule.TH;
          case "FR":
            return RRule.FR;
          case "SA":
            return RRule.SA;
          case "SU":
            return RRule.SU;
          default:
            throw new Error(`Invalid day: ${day}`);
        }
      }),
    });

    const slotDates = rule.all();
    const slotsToSave: SlotData[] = [];
    const now = new Date();

    for (const date of slotDates) {
      const startSlotTime = new Date(date);
      const endSlotTime = new Date(date);

      const [startHour, startMinute] = startTime.split(":").map(Number);
      startSlotTime.setHours(startHour);
      startSlotTime.setMinutes(startMinute);

      const [endHour, endMinute] = endTime.split(":").map(Number);
      endSlotTime.setHours(endHour);
      endSlotTime.setMinutes(endMinute);

      if (isNaN(startSlotTime.getTime()) || isNaN(endSlotTime.getTime())) {
        throw new Error("Invalid time values.");
      }
      if (startSlotTime < now) {
        continue;
      }

      const istStartTime = moment(startSlotTime)
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      const istEndTime = moment(endSlotTime)
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");

      const existingSlot = await this.slotRepository.findSlotByDoctorAndDate(
        doctorId,
        istStartTime
      );
      if (existingSlot) {
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
      return { message: "Slots added successfully!" };
    } else {
      return { message: "Already exist or Past Time cannot be added" };
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
    const updatedSlot = await this.slotRepository.updateSlot(
      slotId,
      updateData
    );
    if (!updatedSlot) {
      throw new Error("Slot not found");
    }
    return updatedSlot;
  }
}
