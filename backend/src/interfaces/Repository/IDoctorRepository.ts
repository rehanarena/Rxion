import { IDoctor } from "../../models/doctorModel";

export interface IDoctorRepository {
  findById(docId: string): Promise<IDoctor | null>;
  updateDoctor(docId: string, update: object): Promise<IDoctor | null>;
}
