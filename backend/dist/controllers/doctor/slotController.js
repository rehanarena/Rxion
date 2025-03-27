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
exports.editSlot = exports.deleteSlot = exports.getSlotsByDoctor = exports.addSlots = exports.slot = void 0;
const slotService_1 = require("../../services/doctor/slotService");
const slotRepository_1 = require("../../repositories/doctor/slotRepository");
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
const slotRepository = new slotRepository_1.SlotRepository();
const slotService = new slotService_1.SlotService(slotRepository);
const slot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docId } = req.params;
        const slots = yield slotService.getAvailableSlots(docId);
        res.status(statusCode_1.default.OK).json({ success: true, slots });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server error while fetching slots.",
        });
    }
});
exports.slot = slot;
const addSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, startDate, endDate, daysOfWeek, startTime, endTime } = req.body;
        const result = yield slotService.addSlots({ doctorId, startDate, endDate, daysOfWeek, startTime, endTime });
        if (result.message === 'Slots added successfully!') {
            res.status(statusCode_1.default.CREATED).json({ success: true, message: result.message });
        }
        else {
            res.status(statusCode_1.default.BAD_REQUEST).json({ success: false, message: result.message });
        }
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || 'Server Error' });
    }
});
exports.addSlots = addSlots;
const getSlotsByDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.params;
        const slots = yield slotService.getSlotsByDoctor(doctorId);
        res.status(statusCode_1.default.OK).json({ success: true, slots });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.getSlotsByDoctor = getSlotsByDoctor;
const deleteSlot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slotId } = req.params;
        yield slotService.deleteSlot(slotId);
        res.status(statusCode_1.default.OK).json({ success: true, message: 'Slot deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.deleteSlot = deleteSlot;
const editSlot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slotId } = req.params;
        const { startTime, endTime } = req.body;
        const updatedSlot = yield slotService.editSlot(slotId, { startTime, endTime });
        res.status(statusCode_1.default.OK).json({
            success: true,
            message: 'Slot updated successfully',
            slot: updatedSlot,
        });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.editSlot = editSlot;
