"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTimeSlots = void 0;
const moment_1 = __importDefault(require("moment"));
const generateTimeSlots = (baseDate, sessionStart, sessionEnd, interval = 30) => {
    const slots = [];
    const [startHours, startMinutes] = sessionStart.split(':').map(Number);
    const [endHours, endMinutes] = sessionEnd.split(':').map(Number);
    const startDate = new Date(baseDate);
    startDate.setHours(startHours, startMinutes, 0, 0);
    const endDate = new Date(baseDate);
    endDate.setHours(endHours, endMinutes, 0, 0);
    while (startDate < endDate) {
        slots.push((0, moment_1.default)(startDate).utcOffset(330).format("hh:mm A"));
        startDate.setMinutes(startDate.getMinutes() + interval);
    }
    return slots;
};
exports.generateTimeSlots = generateTimeSlots;
