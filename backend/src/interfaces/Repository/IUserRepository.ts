import { IUser } from "../../models/userModel";
import { IDoctor } from "../../models/doctorModel";
import { UserData } from "../../interfaces/User/user";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findOne(query: object): Promise<IUser | null>;
  saveUser(user: any): Promise<any>;
  createUser(userData: UserData): Promise<any>;
  findById(userId: string): Promise<IUser | null>;
  findByIdWithoutPassword(userId: string): Promise<IUser | null>;
  updateUser(user: any): Promise<any>;
  updateUser(userId: string, update: object): Promise<any>;
  updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  updateWalletBalance(userId: string, amount: number): Promise<void>;
  resetWalletBalance(userId: string): Promise<void>;
  updateWallet(userId: string, update: object): Promise<IUser | null>;
  getWalletBalance(userId: string): Promise<number>;
  searchDoctors(query: any, sortOptions: any, skip: number, limit: number): Promise<IDoctor[]>;
  countDoctors(query: any): Promise<number>;
}
