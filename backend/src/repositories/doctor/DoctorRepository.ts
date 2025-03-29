import doctorModel from "../../models/doctorModel";
import appointmentModel from "../../models/appoinmentModel";
import { IDoctor } from "../../models/doctorModel";
import specialityModel from "../../models/specialityModel";

export class DoctorRepository {
  async searchDoctors(
    query: any,
    sortOptions: any,
    skip: number,
    limit: number
  ) {
    return await doctorModel
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  async countDoctors(query: any) {
    return await doctorModel.countDocuments(query);
  }

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
    updateData: { fees: number; address: string; available: boolean }
  ): Promise<IDoctor | null> {
    return doctorModel.findByIdAndUpdate(docId, updateData, { new: true });
  }
}
