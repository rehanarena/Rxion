import Specialty, { ISpecialty } from "../../models/specialityModel";
import { ISpecialityRepository } from "../../interfaces/Repository/ISpecialityRepository";

export class SpecialityRepository implements ISpecialityRepository {
  async findSpecialtyByName(name: string): Promise<ISpecialty | null> {
    return Specialty.findOne({ name });
  }

  async insertSpecialty(specialtyData: { name: string; description: string }): Promise<ISpecialty> {
    const specialty = new Specialty(specialtyData);
    return specialty.save();
  }

  async getSpecialties(): Promise<ISpecialty[]> {
    return Specialty.find();
  }

  async deleteSpecialty(specialtyId: string): Promise<ISpecialty | null> {
    return Specialty.findByIdAndDelete(specialtyId);
  }

  async updateSpecialty(
    specialtyId: string,
    updateData: { name?: string; description?: string }
  ): Promise<ISpecialty | null> {
    return Specialty.findByIdAndUpdate(specialtyId, updateData, { new: true });
  }
}
