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
exports.SlotRepository = void 0;
const slotModel_1 = __importDefault(require("../../models/slotModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class SlotRepository {
    getAvailableSlots(doctorId, minStartTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return slotModel_1.default.find({
                doctorId,
                isBooked: false,
                startTime: { $gte: minStartTime },
            }).sort({ startTime: 1 });
        });
    }
    getSlotsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return slotModel_1.default.find({ doctorId });
        });
    }
    findSlotByDoctorAndDate(doctorId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return slotModel_1.default.findOne({ doctorId, date });
        });
    }
    insertSlots(slots) {
        return __awaiter(this, void 0, void 0, function* () {
            const slotsWithObjectIds = slots.map((slot) => (Object.assign(Object.assign({}, slot), { doctorId: new mongoose_1.default.Types.ObjectId(slot.doctorId) })));
            return slotModel_1.default.insertMany(slotsWithObjectIds);
        });
    }
    deleteSlot(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return slotModel_1.default.findByIdAndDelete(slotId);
        });
    }
    updateSlot(slotId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return slotModel_1.default.findByIdAndUpdate(slotId, updateData, { new: true });
        });
    }
}
exports.SlotRepository = SlotRepository;
