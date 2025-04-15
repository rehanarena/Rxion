import { ISlot } from "../../models/slotModel";
import { SlotData } from "../../interfaces/Slot/slot";

export interface ISlotService {
  getAvailableSlots(doctorId: string): Promise<ISlot[]>;

  addSlots(data: {
    doctorId: string;
    startDate: string;
    endDate: string;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
  }): Promise<{ message: string }>;

  getSlotsByDoctor(doctorId: string): Promise<ISlot[]>;

  deleteSlot(slotId: string): Promise<void>;

  editSlot(
    slotId: string,
    updateData: { startTime: string; endTime: string }
  ): Promise<ISlot>;
}
