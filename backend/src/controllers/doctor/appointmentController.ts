import { NextFunction, Request, Response } from 'express';
import HttpStatus from '../../utils/statusCode';
import { IDoctorappointmentService } from '../../interfaces/Service/IDoctorappointmentService';

export class AppointmentController {
  private appointmentService: IDoctorappointmentService;

  constructor(appointmentService: IDoctorappointmentService) {
    this.appointmentService = appointmentService;
  }
async appoinmentsDoctor (req: Request, res: Response): Promise<void>{
  try {
    const { docId } = req.body;
    const appointments = await this.appointmentService.getAppointmentsByDoctor(docId);
    res.status(HttpStatus.OK).json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching appointments.",
    });
  }
};

async appoinmentComplete  (req: Request, res: Response, next:NextFunction): Promise<void> {
  try {
    const { docId, appointmentId } = req.body;
    await this.appointmentService.completeAppointment(docId, appointmentId);
    res.status(HttpStatus.OK).json({ success: true, message: "Appointment Completed" });
  } catch (error) {
   next(error)
  }
};

async appoinmentCancel (req: Request, res: Response, next: NextFunction): Promise<void>{
  try {
    const { docId, appointmentId } = req.body;
    await this.appointmentService.cancelAppointment(docId, appointmentId);
    res.status(HttpStatus.OK).json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
   next(error)
  }
};
}