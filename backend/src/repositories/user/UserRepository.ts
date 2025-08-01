import doctorModel from "../../models/doctorModel";
import userModel, { IUser } from "../../models/userModel";
import { UserData } from "../../interfaces/User/user";
import { IUserRepository } from "../../interfaces/Repository/IUserRepository";
import { BaseRepository } from "../baseRepository";

export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(userModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email });
  }

  async saveUser(user: IUser): Promise<IUser> {
    return await user.save();
  }

  async createUser(userData: UserData): Promise<IUser> {
    const newUser = new this.model(userData);
    return await newUser.save();
  }

  async updateUser(user: IUser): Promise<IUser>;
  async updateUser(userId: string, update: Partial<IUser>): Promise<IUser | null>;
  async updateUser(arg1: any, arg2?: object): Promise<IUser | null> {
    if (typeof arg1 === "string" && arg2 !== undefined) {
      return await this.model.findByIdAndUpdate(arg1, arg2, { new: true });
    } else {
      return await arg1.save();
    }
  }

  async findByIdWithoutPassword(userId: string): Promise<IUser | null> {
    return await this.model.findById(userId).select("-password");
  }

  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async updateWalletBalance(userId: string, amount: number): Promise<void> {
    await this.model.findByIdAndUpdate(userId, {
      $inc: { walletBalance: amount },
    });
  }

  async resetWalletBalance(userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { walletBalance: 0 });
  }

  async updateWallet(userId: string, update: object): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(userId, update, { new: true });
  }

  async getWalletBalance(userId: string): Promise<number> {
    const user = await this.model.findById(userId).select("walletBalance");
    if (!user) throw new Error("User not found");
    return user.walletBalance;
  }

  async searchDoctors(query: any, sortOptions: any, skip: number, limit: number) {
    return await doctorModel
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  async countDoctors(query: any): Promise<number> {
    return await doctorModel.countDocuments(query);
  }
}
