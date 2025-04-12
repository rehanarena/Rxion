import { SpecialityRepository } from "../../repositories/admin/specialityRepository";

export class SpecialityService {
  private specialityRepository: SpecialityRepository;

  constructor(specialityRepository: SpecialityRepository) {
    this.specialityRepository = specialityRepository;
  }
  async addSpecialty(data: {
    name: string;
    description: string;
  }): Promise<{ message: string }> {
    const { name, description } = data;

    if (!name.trim()) {
      throw new Error("Specialty name is required.");
    }

    const existingSpecialty =
      await this.specialityRepository.findSpecialtyByName(name);
    if (existingSpecialty) {
      return { message: "Specialty already exists" };
    }

    await this.specialityRepository.insertSpecialty({ name, description });
    return { message: "Specialty added successfully!" };
  }

  async getSpecialties(): Promise<any[]> {
    return this.specialityRepository.getSpecialties();
  }

  async deleteSpecialty(specialtyId: string): Promise<void> {
    const deletedSpecialty = await this.specialityRepository.deleteSpecialty(
      specialtyId
    );
    if (!deletedSpecialty) {
      throw new Error("Specialty not found");
    }
  }

  async editSpecialty(
    specialtyId: string,
    updateData: { name?: string; description?: string }
  ) {
    const updatedSpecialty = await this.specialityRepository.updateSpecialty(
      specialtyId,
      updateData
    );
    if (!updatedSpecialty) {
      throw new Error("Specialty not found");
    }
    return updatedSpecialty;
  }
}
