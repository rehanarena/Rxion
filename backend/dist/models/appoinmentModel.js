"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const appointmentSchema = new mongoose_1.default.Schema({
    appointmentId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    doctData: { type: Object },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, required: false },
    payment: { type: Boolean, required: false },
    isCompleted: { type: Boolean, required: false },
}, { timestamps: true });
const appointmentModel = mongoose_1.default.models.appointment ||
    mongoose_1.default.model("appointment", appointmentSchema);
exports.default = appointmentModel;
