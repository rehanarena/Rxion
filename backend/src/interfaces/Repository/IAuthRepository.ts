import { IUser } from "../../models/userModel";
import { UserData } from "../../interfaces/User/user";

export interface IAuthRepository {
  findByEmail(email: string): Promise<IUser | null>;
  createUser(userData: UserData): Promise<IUser>;
  findById(userId: string): Promise<IUser | null>;
  findOne(query: object): Promise<IUser | null>;
  saveUser(user: IUser): Promise<IUser>;
}
