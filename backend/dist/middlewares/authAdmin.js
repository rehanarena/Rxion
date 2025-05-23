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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { atoken } = req.headers;
        if (!atoken) {
            res.status(401).json({
                success: false,
                message: "Not Authorized. Login Again.",
            });
            return;
        }
        const token_decode = jsonwebtoken_1.default.verify(atoken, process.env.JWT_SECRET);
        const isValid = `${process.env.ADMIN_EMAIL}${process.env.ADMIN_PASSWORD}` ===
            `${token_decode.email}${token_decode.password}`;
        if (!isValid) {
            res.status(401).json({
                success: false,
                message: "Not Authorized. Login Again.",
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = authAdmin;
