"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const slotSchema = new mongoose_1.default.Schema({
    doctorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "doctor",
        required: true,
    },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
}, { minimize: false });
const slotModel = mongoose_1.default.models.slot || mongoose_1.default.model("slot", slotSchema);
exports.default = slotModel;
