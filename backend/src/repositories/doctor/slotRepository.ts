import Slot, { ISlot } from "../../models/slotModel";
import mongoose from "mongoose";
import { SlotData } from "../../interfaces/Slot/slot";
import { ISlotRepository } from "../../interfaces/Repository/ISlotRepository";
import { BaseRepository } from "../baseRepository";

export class SlotRepository
  extends BaseRepository<ISlot>
  implements ISlotRepository
{
  constructor() {
    super(Slot);
  }

  async getAvailableSlots(
    doctorId: string,
    minStartTime: string
  ): Promise<ISlot[]> {
    return this.find({
      query: { doctorId, isBooked: false, startTime: { $gte: minStartTime } },
      sort: { startTime: 1 },
    });
  }

  async getSlotsByDoctor(doctorId: string): Promise<ISlot[]> {
    return this.find({ query: { doctorId } });
  }

  async findSlotByDoctorAndDate(
    doctorId: string,
    date: string
  ): Promise<ISlot | null> {
    return this.findOne({ doctorId, date });
  }

  async insertSlots(slots: SlotData[]): Promise<ISlot[]> {
    const slotsWithObjectIds = slots.map((slot) => ({
      ...slot,
      doctorId: new mongoose.Types.ObjectId(slot.doctorId),
    }));
    return this.model.insertMany(slotsWithObjectIds);
  }

  async deleteSlot(slotId: string): Promise<ISlot | null> {
    const slot = await this.findById(slotId);
    if (!slot) return null;
    await this.deleteById(slotId);
    return slot;
  }

  async updateSlot(
    slotId: string,
    updateData: { startTime: string; endTime: string }
  ): Promise<ISlot | null> {
    return this.updateById(slotId, updateData as Partial<ISlot>);
  }
}
