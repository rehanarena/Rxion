export class TokenRepository {
  private tokens: Map<string, string>;

  constructor() {
    this.tokens = new Map<string, string>();
  }

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
