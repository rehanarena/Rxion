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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretKey = process.env.JWT_SECRET;
/**
 * Admin authentication middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const authAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const atoken = req.headers.atoken;
        if (!atoken) {
            res.status(401).json({
                success: false,
                message: "Not Authorized. Please log in again.",
            });
            return;
        }
        const tokenDecode = jsonwebtoken_1.default.verify(atoken, secretKey);
        // Validate the decoded token
        const isValid = tokenDecode.email === process.env.ADMIN_EMAIL &&
            tokenDecode.password === process.env.ADMIN_PASSWORD;
        if (!isValid) {
            res.status(401).json({
                success: false,
                message: "Not Authorized. Please log in again.",
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error in admin authentication:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.default = authAdmin;
