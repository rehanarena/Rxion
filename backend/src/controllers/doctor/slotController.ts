import { NextFunction, Request, Response } from 'express';
import { ISlotService } from '../../interfaces/Service/ISlotService';
import HttpStatus from '../../utils/statusCode';

export class SlotController {
  private slotService: ISlotService;

  constructor(slotService: ISlotService) {
    this.slotService = slotService;
  }

  async slot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { docId } = req.params;
      const slots = await this.slotService.getAvailableSlots(docId);
      res.status(HttpStatus.OK).json({ success: true, slots });
    } catch (error) {
      next(error);
    }
  }

  async addSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } = req.body;
      const result = await this.slotService.addSlots({ doctorId, startDate, endDate, daysOfWeek, startTime, endTime });
      
      if (result.message === 'Slots added successfully!') {
        res.status(HttpStatus.CREATED).json({ success: true, message: result.message });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
      }
    } catch (error) {
      next(error);
    }
  }

  async getSlotsByDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId } = req.params;
      const slots = await this.slotService.getSlotsByDoctor(doctorId);
      res.status(HttpStatus.OK).json({ success: true, slots });
    } catch (error) {
      next(error);
    }
  }

  async deleteSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slotId } = req.params;
      await this.slotService.deleteSlot(slotId);
      res.status(HttpStatus.OK).json({ success: true, message: 'Slot deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async editSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slotId } = req.params;
      const { startTime, endTime } = req.body;
      const updatedSlot = await this.slotService.editSlot(slotId, { startTime, endTime });
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Slot updated successfully',
        slot: updatedSlot,
      });
    } catch (error) {
      next(error);
    }
  }
}
