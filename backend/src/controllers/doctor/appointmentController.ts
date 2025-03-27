import { Request, Response } from 'express';
import { AppointmentService } from '../../services/doctor/appointmentService';
import { AppointmentRepository } from '../../repositories/doctor/appointmentRepository';
import HttpStatus from '../../utils/statusCode';

const appointmentRepository = new AppointmentRepository();
const appointmentService = new AppointmentService(appointmentRepository);

export const appoinmentsDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentService.getAppointmentsByDoctor(docId);
    res.status(HttpStatus.OK).json({ success: true, appointments });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching appointments.",
    });
  }
};

export const appoinmentComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, appointmentId } = req.body;
    await appointmentService.completeAppointment(docId, appointmentId);
    res.status(HttpStatus.OK).json({ success: true, message: "Appointment Completed" });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Server error while completing appointment.",
    });
  }
};

export const appoinmentCancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, appointmentId } = req.body;
    await appointmentService.cancelAppointment(docId, appointmentId);
    res.status(HttpStatus.OK).json({ success: true, message: "Appointment Cancelled" });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Server error while cancelling appointment.",
    });
  }
};
