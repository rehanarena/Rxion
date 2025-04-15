import { ISlot } from "../../models/slotModel";
import { SlotData } from "../../interfaces/Slot/slot";

export interface ISlotRepository {
  getAvailableSlots(doctorId: string, minStartTime: string): Promise<ISlot[]>;

  getSlotsByDoctor(doctorId: string): Promise<ISlot[]>;

  findSlotByDoctorAndDate(
    doctorId: string,
    date: string
  ): Promise<ISlot | null>;

  insertSlots(slots: SlotData[]): Promise<ISlot[]>;

  deleteSlot(slotId: string): Promise<ISlot | null>;

  updateSlot(
    slotId: string,
    updateData: { startTime: string; endTime: string }
  ): Promise<ISlot | null>;
}
