"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.link_two = exports.link_one = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.link_one = process.env.NODE_ENV === "PRODUCTION"
    ? process.env.PRODUCTION_CLEINT_LINK_ONE
    : process.env.DEV_CLEINT_LINK_ONE;
exports.link_two = process.env.NODE_ENV === "PRODUCTION"
    ? process.env.PRODUCTION_CLEINT_LINK_TWO
    : process.env.DEV_CLEINT_LINK_TWO;
