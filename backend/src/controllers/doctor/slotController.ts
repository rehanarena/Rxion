import { Request, Response } from 'express';
import { SlotService } from '../../services/doctor/slotService';
import { SlotRepository } from '../../repositories/doctor/slotRepository';

const slotRepository = new SlotRepository();
const slotService = new SlotService(slotRepository);

export const slot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.params;
    const slots = await slotService.getAvailableSlots(docId);
    res.json({ success: true, slots });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching slots.",
    });
  }
};

export const addSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } = req.body;
    const result = await slotService.addSlots({ doctorId, startDate, endDate, daysOfWeek, startTime, endTime });
    if (result.message === 'Slots added successfully!') {
      res.json({ success: true, message: result.message });
    } else {
      res.json({ success: false, message: result.message });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getSlotsByDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const slots = await slotService.getSlotsByDoctor(doctorId);
    res.json({ success: true, slots });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId } = req.params;
    await slotService.deleteSlot(slotId);
    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const editSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;
    const updatedSlot = await slotService.editSlot(slotId, { startTime, endTime });
    res.json({
      success: true,
      message: 'Slot updated successfully',
      slot: updatedSlot,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
