export interface ITokenRepository {
  setToken(userId: string, token: string): void;
  getToken(userId: string): string | undefined;
}
