// services/UserService.ts
import { UserRepository } from "../repositories/UserRepository";


export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getWalletBalance(userId: string): Promise<number> {
    return await this.userRepository.getWalletBalance(userId);
  }
}

export default new UserService();
