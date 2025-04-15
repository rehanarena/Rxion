export interface ISpecialityService {
  addSpecialty(data: {
    name: string;
    description: string;
  }): Promise<{ message: string }>;

  getSpecialties(): Promise<any[]>;

  deleteSpecialty(specialtyId: string): Promise<void>;

  editSpecialty(
    specialtyId: string,
    updateData: { name?: string; description?: string }
  ): Promise<any>;
}
