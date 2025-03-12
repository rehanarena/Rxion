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
}
