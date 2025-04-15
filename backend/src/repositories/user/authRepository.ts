import userModel from "../../models/userModel";
import { IUser } from "../../models/userModel";
import { UserData } from "../../interfaces/User/user";

import { IAuthRepository } from "../../interfaces/Repository/IAuthRepository";

export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await userModel.findOne({ email });
  }

  async createUser(userData: UserData): Promise<IUser> {
    const newUser = new userModel(userData);
    return await newUser.save();
  }

  async findById(userId: string): Promise<IUser | null> {
    return await userModel.findById(userId);
  }

  async updateUser(userId: string, update: object): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(userId, update, { new: true });
  }

  async saveUser(user: IUser): Promise<IUser> {
    return await user.save();
  }
  async findOne(query: object) {
    return await userModel.findOne(query);
  }
}
