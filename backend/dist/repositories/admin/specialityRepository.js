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
exports.SpecialityRepository = void 0;
const specialityModel_1 = __importDefault(require("../../models/specialityModel"));
class SpecialityRepository {
    findSpecialtyByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return specialityModel_1.default.findOne({ name });
        });
    }
    insertSpecialty(specialtyData) {
        return __awaiter(this, void 0, void 0, function* () {
            const specialty = new specialityModel_1.default(specialtyData);
            return specialty.save();
        });
    }
    getSpecialties() {
        return __awaiter(this, void 0, void 0, function* () {
            return specialityModel_1.default.find();
        });
    }
    deleteSpecialty(specialtyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return specialityModel_1.default.findByIdAndDelete(specialtyId);
        });
    }
    updateSpecialty(specialtyId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return specialityModel_1.default.findByIdAndUpdate(specialtyId, updateData, { new: true });
        });
    }
}
exports.SpecialityRepository = SpecialityRepository;
