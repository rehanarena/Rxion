import { SearchParams} from "../../interfaces/User/user";

export interface IUserService {
  changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<string>;
  getProfile(userId: string): Promise<any>;
  updateProfile(userId: string, name: string, phone: string, address: string, dob: string, gender: string, imageFile?: Express.Multer.File, medicalHistory?: string): Promise<{ message: string }>;
  getWalletBalance(userId: string): Promise<number>;
  searchDoctors(params: SearchParams): Promise<any>;
}
