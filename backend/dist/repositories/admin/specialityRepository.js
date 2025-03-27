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
exports.updateSpecialty = exports.deleteSpecialty = exports.getSpecialties = exports.insertSpecialty = exports.findSpecialtyByName = void 0;
// specialty.repository.ts
const specialityModel_1 = __importDefault(require("../../models/specialityModel"));
const findSpecialtyByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return specialityModel_1.default.findOne({ name });
});
exports.findSpecialtyByName = findSpecialtyByName;
const insertSpecialty = (specialtyData) => __awaiter(void 0, void 0, void 0, function* () {
    const specialty = new specialityModel_1.default(specialtyData);
    return specialty.save();
});
exports.insertSpecialty = insertSpecialty;
const getSpecialties = () => __awaiter(void 0, void 0, void 0, function* () {
    return specialityModel_1.default.find();
});
exports.getSpecialties = getSpecialties;
const deleteSpecialty = (specialtyId) => __awaiter(void 0, void 0, void 0, function* () {
    return specialityModel_1.default.findByIdAndDelete(specialtyId);
});
exports.deleteSpecialty = deleteSpecialty;
const updateSpecialty = (specialtyId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return specialityModel_1.default.findByIdAndUpdate(specialtyId, updateData, { new: true });
});
exports.updateSpecialty = updateSpecialty;
