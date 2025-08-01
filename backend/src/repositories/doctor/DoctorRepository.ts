import doctorModel, { IDoctor } from "../../models/doctorModel";
import appointmentModel, { IAppointment } from "../../models/appoinmentModel";
import { BaseRepository } from "../baseRepository";
import { IDoctorRepository } from "../../interfaces/Repository/IDoctorRepository";

export class DoctorRepository
  extends BaseRepository<IDoctor>
  implements IDoctorRepository
{
  constructor() {
    super(doctorModel);
  }

  async findByEmail(email: string): Promise<IDoctor | null> {
    return this.findOne({ email });
  }

  async updateDoctor(
    docId: string,
    update: Partial<IDoctor>
  ): Promise<IDoctor | null> {
    return this.updateById(docId, update);
  }

  async saveDoctor(doc: IDoctor): Promise<IDoctor> {
    return doc.save();
  }
  async getAppointments(docId: string): Promise<IAppointment[]> {
    return this.model.db
      .collection(appointmentModel.collection.name)
      .find({ docId })
      .toArray() as Promise<IAppointment[]>;
  }
  async updateAvailability(
    docId: string,
    available: boolean
  ): Promise<IDoctor | null> {
    return this.updateById(docId, { available } as Partial<IDoctor>);
  }
  async getAllDoctors(): Promise<IDoctor[]> {
    return this.find({ projection: "-password -email" });
  }

  async getDoctorProfile(docId: string): Promise<IDoctor | null> {
    return this.findById(docId, "-password");
  }

  async updateDoctorProfile(
    docId: string,
    updateData: {
      fees?: number;
      address?: Record<string, any>;
      available?: boolean;
      experience?: string;
      about?: string;
    }
  ): Promise<IDoctor | null> {
    return this.updateById(docId, updateData as Partial<IDoctor>);
  }
  async updatingDoctor(doctor: IDoctor): Promise<IDoctor> {
    return doctor.save();
  }
}
