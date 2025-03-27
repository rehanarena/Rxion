import { Request, Response } from 'express';
import * as specialtyService from '../../services/admin/specialityService';
import HttpStatus from '../../utils/statusCode';

export const addSpecialty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const result = await specialtyService.addSpecialty({ name, description });
    if (result.message === 'Specialty added successfully!') {
      res.status(HttpStatus.CREATED).json({ success: true, message: result.message });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
    }
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getSpecialties = async (req: Request, res: Response): Promise<void> => {
  try {
    const specialties = await specialtyService.getSpecialties();
    res.status(HttpStatus.OK).json({ success: true, specialties });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const deleteSpecialty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialtyId } = req.params;
    await specialtyService.deleteSpecialty(specialtyId);
    res.status(HttpStatus.OK).json({ success: true, message: 'Specialty deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const editSpecialty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialtyId } = req.params;
    const { name, description } = req.body;
    const updatedSpecialty = await specialtyService.editSpecialty(specialtyId, { name, description });
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Specialty updated successfully',
      specialty: updatedSpecialty,
    });
  } catch (error: any) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};
