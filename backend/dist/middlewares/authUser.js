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
const authUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.json({
                success: false,
                message: "Not Authorized. Please log in again.",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.json({ success: false, message: "Token not found." });
            return;
        }
        const token_decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    }
    catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
});
exports.default = authUser;
