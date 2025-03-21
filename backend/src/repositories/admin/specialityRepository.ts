// specialty.repository.ts
import Specialty, { ISpecialty } from '../../models/specialityModel';

export const findSpecialtyByName = async (name: string): Promise<ISpecialty | null> => {
  return Specialty.findOne({ name });
};

export const insertSpecialty = async (specialtyData: { name: string; description: string }): Promise<ISpecialty> => {
  const specialty = new Specialty(specialtyData);
  return specialty.save();
};

export const getSpecialties = async (): Promise<ISpecialty[]> => {
  return Specialty.find();
};

export const deleteSpecialty = async (specialtyId: string): Promise<ISpecialty | null> => {
  return Specialty.findByIdAndDelete(specialtyId);
};

export const updateSpecialty = async (
  specialtyId: string,
  updateData: { name?: string; description?: string }
): Promise<ISpecialty | null> => {
  return Specialty.findByIdAndUpdate(specialtyId, updateData, { new: true });
};
