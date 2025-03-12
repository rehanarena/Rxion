// repositories/DoctorRepository.ts
import doctorModel from '../models/doctorModel';

export class DoctorRepository {
  async searchDoctors(query: any, sortOptions: any, skip: number, limit: number) {
    return await doctorModel.find(query).sort(sortOptions).skip(skip).limit(limit);
  }

  async countDoctors(query: any) {
    return await doctorModel.countDocuments(query);
  }
  async findById(docId: string) {
    return await doctorModel.findById(docId);
  }

  async updateDoctor(doc: any): Promise<any>;
  async updateDoctor(docId: string, update: object): Promise<any>;
  async updateDoctor(arg1: any, arg2?: object): Promise<any> {
    if (typeof arg1 === 'string' && arg2 !== undefined) {
      // Called with docId and update object
      return await doctorModel.findByIdAndUpdate(arg1, arg2, { new: true });
    } else {
      // Called with a doctor document (update via doc.save())
      return await arg1.save();
    }
  }
}
