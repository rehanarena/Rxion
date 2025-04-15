import { ITokenRepository } from "../../interfaces/Repository/ITokenRepository";

export class TokenRepository implements ITokenRepository {
  private tokens: Map<string, string> = new Map();

  setToken(userId: string, token: string): void {
    this.tokens.set(userId, token);
  }

  getToken(userId: string): string | undefined {
    return this.tokens.get(userId);
  }

  removeToken(userId: string): void {
    this.tokens.delete(userId);
  }
}
