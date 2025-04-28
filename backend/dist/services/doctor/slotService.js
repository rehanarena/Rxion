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
exports.SlotService = void 0;
const rrule_1 = require("rrule");
const moment_1 = __importDefault(require("moment"));
class SlotService {
    constructor(slotRepository) {
        this.slotRepository = slotRepository;
    }
    getAvailableSlots(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = new Date();
            currentTime.setMinutes(currentTime.getMinutes() + 30);
            const minStartTime = currentTime.toISOString();
            return this.slotRepository.getAvailableSlots(doctorId, minStartTime);
        });
    }
    addSlots(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } = data;
            if (!startDate || !endDate) {
                throw new Error("Start and End dates are required.");
            }
            if (!daysOfWeek || daysOfWeek.length === 0) {
                throw new Error("Days of the week are required.");
            }
            if (!startTime || !endTime) {
                throw new Error("Start and End times are required.");
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();
            if (end < start) {
                throw new Error("End date cannot be before start date.");
            }
            // Create rule for recurrence
            const rule = new rrule_1.RRule({
                freq: rrule_1.RRule.WEEKLY,
                dtstart: start,
                until: end,
                byweekday: daysOfWeek.map(day => {
                    switch (day.toUpperCase()) {
                        case "MO": return rrule_1.RRule.MO;
                        case "TU": return rrule_1.RRule.TU;
                        case "WE": return rrule_1.RRule.WE;
                        case "TH": return rrule_1.RRule.TH;
                        case "FR": return rrule_1.RRule.FR;
                        case "SA": return rrule_1.RRule.SA;
                        case "SU": return rrule_1.RRule.SU;
                        default: throw new Error(`Invalid day: ${day}`);
                    }
                }),
            });
            const slotDates = rule.all();
            const slotsToSave = [];
            let skippedSlots = 0;
            for (const date of slotDates) {
                const startSlotTime = new Date(date);
                const endSlotTime = new Date(date);
                const [startHour, startMinute] = startTime.split(":").map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);
                startSlotTime.setHours(startHour, startMinute, 0);
                endSlotTime.setHours(endHour, endMinute, 0);
                if (isNaN(startSlotTime.getTime()) || isNaN(endSlotTime.getTime())) {
                    throw new Error("Invalid start or end time.");
                }
                if (startSlotTime < now) {
                    // Check if it's today with past time
                    if (startSlotTime.toDateString() === now.toDateString()) {
                        throw new Error("Past time cannot be selected for today's date.");
                    }
                    skippedSlots++;
                    continue;
                }
                // Validate selected day matches the date's actual weekday
                const weekdayIndex = startSlotTime.getDay(); // 0 (Sun) to 6 (Sat)
                const selectedDay = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][weekdayIndex];
                if (!daysOfWeek.includes(selectedDay)) {
                    throw new Error(`Selected day does not match date (${startSlotTime.toDateString()}).`);
                }
                const istStartTime = (0, moment_1.default)(startSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
                const istEndTime = (0, moment_1.default)(endSlotTime).utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
                const existingSlot = yield this.slotRepository.findSlotByDoctorAndDate(doctorId, istStartTime);
                if (existingSlot) {
                    skippedSlots++;
                    continue;
                }
                slotsToSave.push({
                    doctorId,
                    date: istStartTime,
                    startTime: istStartTime,
                    endTime: istEndTime,
                    isBooked: false,
                });
            }
            if (slotsToSave.length > 0) {
                yield this.slotRepository.insertSlots(slotsToSave);
                let msg = `Slots added successfully!`;
                if (skippedSlots > 0) {
                    msg += ` ${skippedSlots} slot(s) skipped (either past or already exist).`;
                }
                return { message: msg };
            }
            else {
                throw new Error("All selected slots are either in the past or already exist.");
            }
        });
    }
    getSlotsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slotRepository.getSlotsByDoctor(doctorId);
        });
    }
    deleteSlot(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedSlot = yield this.slotRepository.deleteSlot(slotId);
            if (!deletedSlot) {
                throw new Error("Slot not found");
            }
        });
    }
    editSlot(slotId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedSlot = yield this.slotRepository.updateSlot(slotId, updateData);
            if (!updatedSlot) {
                throw new Error("Slot not found");
            }
            return updatedSlot;
        });
    }
}
exports.SlotService = SlotService;
