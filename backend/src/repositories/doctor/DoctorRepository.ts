import doctorModel from "../../models/doctorModel";
import appointmentModel from "../../models/appoinmentModel";
import { IDoctor } from "../../models/doctorModel";
import { IDoctorRepository } from "../../interfaces/Repository/IDoctorRepository";

export class DoctorRepository implements IDoctorRepository {

  async findById(docId: string): Promise<IDoctor | null> {
    return await doctorModel.findById(docId);
  }

  async findByEmail(email: string) {
    return await doctorModel.findOne({ email });
  }

  async findOne(query: object) {
    return await doctorModel.findOne(query);
  }

  async updateDoctor(docId: string, update: object): Promise<any> {
    return await doctorModel.findByIdAndUpdate(docId, update, { new: true });
  }

  async saveDoctor(doc: any): Promise<any> {
    return await doc.save();
  }
  async getAppointments(docId: string) {
    return appointmentModel.find({ docId });
  }
  async updateAvailability(docId: string, available: boolean): Promise<void> {
    await doctorModel.findByIdAndUpdate(docId, { available });
  }
  async getAllDoctors(): Promise<IDoctor[]> {
    return doctorModel.find({}).select(["-password", "-email"]);
  }
  async getDoctorProfile(docId: string): Promise<IDoctor | null> {
    return doctorModel.findById(docId).select("-password");
  }
  async updateDoctorProfile(
    docId: string,
    updateData: { fees: number; address: Record<string, any>; available: boolean; experience: string; about: string }
  ): Promise<IDoctor | null> {
    return doctorModel.findByIdAndUpdate(docId, { $set: updateData }, { new: true });
  }
  async updatingDoctor(doctor: IDoctor): Promise<IDoctor> {
    return await doctor.save();
  }
  
}
