"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTimeSlots = void 0;
// src/utils/timeHelpers.ts
const moment_1 = __importDefault(require("moment"));
/**
 * Generates an array of slot times (e.g., every 30 minutes) between two times.
 * @param baseDate - The base date for the session.
 * @param sessionStart - The session's start time (e.g., "10:00").
 * @param sessionEnd - The session's end time (e.g., "12:00").
 * @param interval - The interval in minutes between each slot (default: 30).
 * @returns An array of formatted time slot strings.
 */
const generateTimeSlots = (baseDate, sessionStart, sessionEnd, interval = 30) => {
    const slots = [];
    // Create Date objects for the session start and end.
    const [startHours, startMinutes] = sessionStart.split(':').map(Number);
    const [endHours, endMinutes] = sessionEnd.split(':').map(Number);
    const startDate = new Date(baseDate);
    startDate.setHours(startHours, startMinutes, 0, 0);
    const endDate = new Date(baseDate);
    endDate.setHours(endHours, endMinutes, 0, 0);
    // Generate slot times until reaching endDate.
    while (startDate < endDate) {
        slots.push((0, moment_1.default)(startDate).utcOffset(330).format("hh:mm A"));
        startDate.setMinutes(startDate.getMinutes() + interval);
    }
    return slots;
};
exports.generateTimeSlots = generateTimeSlots;
