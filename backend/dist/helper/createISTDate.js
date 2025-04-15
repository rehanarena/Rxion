"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const createISTDate = (baseDate, timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(baseDate);
    newDate.setHours(hours, minutes, 0, 0);
    return (0, moment_1.default)(newDate).utcOffset(330).format("hh:mm A");
};
exports.default = createISTDate;
