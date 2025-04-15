import { NextFunction, Request, Response } from "express";
import { ISpecialityService } from "../../interfaces/Service/ISpecialityService";
import HttpStatus from "../../utils/statusCode";

export class SpecialityController {
  private specialityService: ISpecialityService;

  constructor(specialityService: ISpecialityService) {
    this.specialityService = specialityService;
  }

  async addSpecialty(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, description } = req.body;
      const result = await this.specialityService.addSpecialty({
        name,
        description,
      });
      if (result.message === "Specialty added successfully!") {
        res
          .status(HttpStatus.CREATED)
          .json({ success: true, message: result.message });
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: result.message });
      }
    } catch (error) {
      next(error);
    }
  }

  async getSpecialties(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const specialties = await this.specialityService.getSpecialties();
      res.status(HttpStatus.OK).json({ success: true, specialties });
    } catch (error) {
      next(error);
    }
  }

  async deleteSpecialty(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { specialtyId } = req.params;
      await this.specialityService.deleteSpecialty(specialtyId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Specialty deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async editSpecialty(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { specialtyId } = req.params;
      const { name, description } = req.body;
      const updatedSpecialty = await this.specialityService.editSpecialty(
        specialtyId,
        { name, description }
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Specialty updated successfully",
        specialty: updatedSpecialty,
      });
    } catch (error) {
      next(error);
    }
  }
}
