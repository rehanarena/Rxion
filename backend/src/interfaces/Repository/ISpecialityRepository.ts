import { ISpecialty } from "../../models/specialityModel";

export interface ISpecialityRepository {
  findSpecialtyByName(name: string): Promise<ISpecialty | null>;

  insertSpecialty(specialtyData: {
    name: string;
    description: string;
  }): Promise<ISpecialty>;

  getSpecialties(): Promise<ISpecialty[]>;

  deleteSpecialty(specialtyId: string): Promise<ISpecialty | null>;

  updateSpecialty(
    specialtyId: string,
    updateData: { name?: string; description?: string }
  ): Promise<ISpecialty | null>;
}
