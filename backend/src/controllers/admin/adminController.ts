import { NextFunction, Request, Response } from "express";
import HttpStatus from "../../utils/statusCode";
import { IAdminService } from "../../interfaces/Service/IAdminService";

export class AdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }
  async addDoctor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;
      const imageFile = req.file;

      if (!imageFile) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Image file missing" });
        return;
      }

      await this.adminService.addDoctor(data, imageFile);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Doctor Added Successfully and Password Sent to Email",
      });
    } catch (error) {
      next(error);
    }
  }

  async loginAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const { token } = await this.adminService.loginAdmin(email, password);
      res.status(HttpStatus.OK).json({ success: true, token });
    } catch (error) {
      next(error);
    }
  }

  async userList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const search = (req.query.search as string) || "";
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const result = await this.adminService.getUsers(search, page, limit);

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async blockUnblockUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const { action } = req.body;
    try {
      const result = await this.adminService.blockUnblockUser(id, action);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async blockUnblockDoctor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const { action } = req.body;
    try {
      const result = await this.adminService.blockUnblockDoctor(id, action);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async doctorList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { search, page = "1", limit = "8", speciality } = req.query;
      const result = await this.adminService.doctorList({
        search: search as string,
        page: page as string,
        limit: limit as string,
        speciality: speciality as string,
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async allDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctors = await this.adminService.allDoctors();
      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { doctorId } = req.params;
    try {
      const doctor = await this.adminService.getDoctor(doctorId);
      if (!doctor) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "Doctor not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, doctor });
    } catch (error) {
      next(error);
    }
  }

  /// All appointment list ///
  async appointmentsAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        search = "",
        sortField = "slotDate",
        sortOrder = "asc",
        page = "1",
        limit = "10",
      } = req.query;

      const options = {
        search: search.toString(),
        sortField: sortField.toString(),
        sortOrder: sortOrder.toString(),
        page: parseInt(page.toString(), 10),
        limit: parseInt(limit.toString(), 10),
      };

      const appointments = await this.adminService.getAllAppointments(options);
      res.status(HttpStatus.OK).json({ success: true, appointments });
    } catch (error) {
      next(error);
    }
  }

  /// Cancel Appointment ///
  async cancelAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { appointmentId } = req.body as { appointmentId: string };
      const result = await this.adminService.cancelAppointment(appointmentId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
