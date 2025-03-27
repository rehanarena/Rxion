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
            if (!daysOfWeek || daysOfWeek.length === 0) {
                throw new Error("Days of week are required.");
            }
            if (!startTime || !endTime) {
                throw new Error("Start and End times are required.");
            }
            const rule = new rrule_1.RRule({
                freq: rrule_1.RRule.WEEKLY,
                dtstart: new Date(startDate),
                until: new Date(endDate),
                byweekday: daysOfWeek.map((day) => {
                    switch (day.toUpperCase()) {
                        case "MO":
                            return rrule_1.RRule.MO;
                        case "TU":
                            return rrule_1.RRule.TU;
                        case "WE":
                            return rrule_1.RRule.WE;
                        case "TH":
                            return rrule_1.RRule.TH;
                        case "FR":
                            return rrule_1.RRule.FR;
                        case "SA":
                            return rrule_1.RRule.SA;
                        case "SU":
                            return rrule_1.RRule.SU;
                        default:
                            throw new Error(`Invalid day: ${day}`);
                    }
                }),
            });
            const slotDates = rule.all();
            const slotsToSave = [];
            const now = new Date();
            for (const date of slotDates) {
                const startSlotTime = new Date(date);
                const endSlotTime = new Date(date);
                const [startHour, startMinute] = startTime.split(":").map(Number);
                startSlotTime.setHours(startHour);
                startSlotTime.setMinutes(startMinute);
                const [endHour, endMinute] = endTime.split(":").map(Number);
                endSlotTime.setHours(endHour);
                endSlotTime.setMinutes(endMinute);
                if (isNaN(startSlotTime.getTime()) || isNaN(endSlotTime.getTime())) {
                    throw new Error("Invalid time values.");
                }
                if (startSlotTime < now) {
                    continue;
                }
                const istStartTime = (0, moment_1.default)(startSlotTime)
                    .utcOffset(330)
                    .format("YYYY-MM-DD HH:mm:ss");
                const istEndTime = (0, moment_1.default)(endSlotTime)
                    .utcOffset(330)
                    .format("YYYY-MM-DD HH:mm:ss");
                const existingSlot = yield this.slotRepository.findSlotByDoctorAndDate(doctorId, istStartTime);
                if (existingSlot) {
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
                return { message: "Slots added successfully!" };
            }
            else {
                return { message: "Already exist or Past Time cannot be added" };
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
