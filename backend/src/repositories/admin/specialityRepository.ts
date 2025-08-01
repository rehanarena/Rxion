import Specialty, { ISpecialty } from "../../models/specialityModel";
import { BaseRepository } from "../baseRepository";
import { ISpecialityRepository } from "../../interfaces/Repository/ISpecialityRepository";

export class SpecialityRepository
  extends BaseRepository<ISpecialty>
  implements ISpecialityRepository
{
  constructor() {
    super(Specialty);
  }

  async findSpecialtyByName(name: string): Promise<ISpecialty | null> {
    return this.findOne({ name });
  }

  async insertSpecialty(specialtyData: {
    name: string;
    description: string;
  }): Promise<ISpecialty> {
    return this.create(specialtyData as Partial<ISpecialty>);
  }

  async getSpecialties(): Promise<ISpecialty[]> {
    return this.find();
  }
  async deleteSpecialty(specialtyId: string): Promise<ISpecialty | null> {
    const existing = await this.findById(specialtyId);
    if (!existing) return null;
    await this.deleteById(specialtyId);
    return existing;
  }

  async updateSpecialty(
    specialtyId: string,
    updateData: { name?: string; description?: string }
  ): Promise<ISpecialty | null> {
    return this.updateById(specialtyId, updateData as Partial<ISpecialty>);
  }
}
