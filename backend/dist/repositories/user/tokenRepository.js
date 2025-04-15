"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
class TokenRepository {
    constructor() {
        this.tokens = new Map();
    }
    setToken(userId, token) {
        this.tokens.set(userId, token);
    }
    getToken(userId) {
        return this.tokens.get(userId);
    }
    removeToken(userId) {
        this.tokens.delete(userId);
    }
}
exports.TokenRepository = TokenRepository;
