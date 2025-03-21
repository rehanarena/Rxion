// specialty.service.ts
import * as specialtyRepository from '../../repositories/admin/specialityRepository';

export const addSpecialty = async (data: { name: string; description: string }): Promise<{ message: string }> => {
  const { name, description } = data;
  
  if (!name.trim()) {
    throw new Error("Specialty name is required.");
  }
  
  // Optional: Check if the specialty already exists
  const existingSpecialty = await specialtyRepository.findSpecialtyByName(name);
  if (existingSpecialty) {
    return { message: "Specialty already exists" };
  }
  
  await specialtyRepository.insertSpecialty({ name, description });
  return { message: "Specialty added successfully!" };
};

export const getSpecialties = async (): Promise<any[]> => {
  return specialtyRepository.getSpecialties();
};

export const deleteSpecialty = async (specialtyId: string): Promise<void> => {
  const deletedSpecialty = await specialtyRepository.deleteSpecialty(specialtyId);
  if (!deletedSpecialty) {
    throw new Error("Specialty not found");
  }
};

export const editSpecialty = async (
  specialtyId: string,
  updateData: { name?: string; description?: string }
) => {
  const updatedSpecialty = await specialtyRepository.updateSpecialty(specialtyId, updateData);
  if (!updatedSpecialty) {
    throw new Error("Specialty not found");
  }
  return updatedSpecialty;
};
