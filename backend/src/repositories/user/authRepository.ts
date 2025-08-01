import userModel, { IUser } from "../../models/userModel";
import { BaseRepository } from "../baseRepository";
import { UserData } from "../../interfaces/User/user";
import { IAuthRepository } from "../../interfaces/Repository/IAuthRepository";

export class AuthRepository
  extends BaseRepository<IUser>
  implements IAuthRepository {
  constructor() {
    super(userModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async createUser(data: UserData): Promise<IUser> {
    return this.create(data as Partial<IUser>);
  }

  async saveUser(user: IUser): Promise<IUser> {
    return user.save();
  }
}
