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
exports.loginAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretKey = process.env.JWT_SECRET;
/**
 * Create a JWT token for admin authentication.
 * @param email - Admin email
 * @param password - Admin password
 * @returns Signed JWT token
 */
const createAdminToken = (email, password) => {
    return jsonwebtoken_1.default.sign({ email, password }, secretKey, { expiresIn: "1h" });
};
/**
 * API for admin login
 * @param req - Express request object
 * @param res - Express response object
 */
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
            return;
        }
        // Check credentials
        if (email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD) {
            const token = createAdminToken(email, password); // Generate token
            res.status(200).json({
                success: true,
                token,
                message: "Admin login successful",
            });
        }
        else {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
    }
    catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.loginAdmin = loginAdmin;
