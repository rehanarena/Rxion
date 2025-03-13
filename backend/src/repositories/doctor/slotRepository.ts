import Slot from "../../models/slotModel";
import { ISlot } from "../../models/slotModel";
import mongoose from "mongoose";

interface SlotData {
  doctorId: string;
  date: string;
  isBooked: boolean;
  startTime: string;
  endTime: string;
}

export class SlotRepository {
  async getAvailableSlots(
    doctorId: string,
    minStartTime: string
  ): Promise<ISlot[]> {
    return Slot.find({
      doctorId,
      isBooked: false,
      startTime: { $gte: minStartTime },
    }).sort({ startTime: 1 });
  }

  async getSlotsByDoctor(doctorId: string): Promise<ISlot[]> {
    return Slot.find({ doctorId });
  }

  async findSlotByDoctorAndDate(
    doctorId: string,
    date: string
  ): Promise<ISlot | null> {
    return Slot.findOne({ doctorId, date });
  }

  async insertSlots(slots: SlotData[]): Promise<ISlot[]> {
    const slotsWithObjectIds = slots.map((slot) => ({
      ...slot,
      doctorId: new mongoose.Types.ObjectId(slot.doctorId),
    }));

    return Slot.insertMany(slotsWithObjectIds);
  }

  async deleteSlot(slotId: string): Promise<ISlot | null> {
    return Slot.findByIdAndDelete(slotId);
  }

  async updateSlot(
    slotId: string,
    updateData: { startTime: string; endTime: string }
  ): Promise<ISlot | null> {
    return Slot.findByIdAndUpdate(slotId, updateData, { new: true });
  }
}
