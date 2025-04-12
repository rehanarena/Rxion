"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
class AuthRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findOne({ email });
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new userModel_1.default(userData);
            return yield newUser.save();
        });
    }
    findById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findById(userId);
        });
    }
    updateUser(userId, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findByIdAndUpdate(userId, update, { new: true });
        });
    }
    saveUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user.save();
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findOne(query);
        });
    }
}
exports.AuthRepository = AuthRepository;
