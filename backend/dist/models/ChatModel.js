"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ChatModel.ts
const mongoose_1 = require("mongoose");
const ChatSchema = new mongoose_1.Schema({
    room: { type: String, required: true },
    sender: { type: String, required: true },
    message: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    file: {
        url: String,
        type: String,
        fileName: String,
    },
    patientName: { type: String, default: "" },
    patientImage: { type: String, default: "" },
});
exports.default = (0, mongoose_1.model)("ChatMessage", ChatSchema);
