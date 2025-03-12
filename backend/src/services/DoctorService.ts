// services/DoctorService.ts
import { DoctorRepository } from '../repositories/DoctorRepository';

interface SearchParams {
  speciality?: string;
  search?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

export class DoctorService {
  private doctorRepository: DoctorRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
  }

  async searchDoctors(params: SearchParams) {
    const { speciality, search, sortBy, page = "1", limit = "8" } = params;
    let query: any = {};

    if (speciality) {
      query.speciality = speciality;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { speciality: { $regex: search, $options: "i" } },
      ];
    }

    let sortOptions: any = {};
    // If sorting by availability, we add a filter instead of a sort.
    if (sortBy === "availability") {
      query.available = true;
    } else if (sortBy === "fees") {
      sortOptions.fees = 1; // ascending order
    } else if (sortBy === "experience") {
      sortOptions.experience = -1; // descending order
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;
    const skip = (pageNum - 1) * limitNum;

    const doctors = await this.doctorRepository.searchDoctors(query, sortOptions, skip, limitNum);
    const totalDoctors = await this.doctorRepository.countDoctors(query);

    return {
      totalPages: Math.ceil(totalDoctors / limitNum),
      currentPage: pageNum,
      totalDoctors,
      doctors,
    };
  }
}
