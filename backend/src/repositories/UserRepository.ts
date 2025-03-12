// repositories/UserRepository.ts
import userModel from '../models/userModel';
import { IUser } from '../models/userModel';

interface UserData {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await userModel.findOne({ email });
  }

  async createUser(userData: UserData) {
    const newUser = new userModel(userData);
    return await newUser.save();
  }

  async findById(userId: string) {
    return await userModel.findById(userId);
  }
  async updateUser(user: any): Promise<any>;
  async updateUser(userId: string, update: object): Promise<any>;
  async updateUser(arg1: any, arg2?: object): Promise<any> {
    if (typeof arg1 === 'string' && arg2 !== undefined) {
      // When called with userId and update object.
      return await userModel.findByIdAndUpdate(arg1, arg2, { new: true });
    } else {
      // When called with a user document.
      return await arg1.save();
    }
  }
  async findByIdWithoutPassword(userId: string) {
    return await userModel.findById(userId).select("-password");
  }

  async updateProfile(userId: string, updateData: Partial<IUser>) {
    return await userModel.findByIdAndUpdate(userId, updateData, { new: true });
  }
  async updateWalletBalance(userId: string, amount: number): Promise<void> {
    await userModel.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  }
  async resetWalletBalance(userId: string): Promise<void> {
    await userModel.findByIdAndUpdate(userId, { walletBalance: 0 });
  }
  async updateWallet(userId: string, update: object): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(userId, update, { new: true });
  }
  async getWalletBalance(userId: string): Promise<number> {
    const user = await userModel.findById(userId).select("walletBalance");
    if (!user) throw new Error("User not found");
    return user.walletBalance;
  }
}
