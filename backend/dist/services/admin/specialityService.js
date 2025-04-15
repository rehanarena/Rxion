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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialityService = void 0;
class SpecialityService {
    constructor(specialityRepository) {
        this.specialityRepository = specialityRepository;
    }
    addSpecialty(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description } = data;
            if (!name.trim()) {
                throw new Error("Specialty name is required.");
            }
            const existingSpecialty = yield this.specialityRepository.findSpecialtyByName(name);
            if (existingSpecialty) {
                return { message: "Specialty already exists" };
            }
            yield this.specialityRepository.insertSpecialty({ name, description });
            return { message: "Specialty added successfully!" };
        });
    }
    getSpecialties() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.specialityRepository.getSpecialties();
        });
    }
    deleteSpecialty(specialtyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedSpecialty = yield this.specialityRepository.deleteSpecialty(specialtyId);
            if (!deletedSpecialty) {
                throw new Error("Specialty not found");
            }
        });
    }
    editSpecialty(specialtyId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedSpecialty = yield this.specialityRepository.updateSpecialty(specialtyId, updateData);
            if (!updatedSpecialty) {
                throw new Error("Specialty not found");
            }
            return updatedSpecialty;
        });
    }
}
exports.SpecialityService = SpecialityService;
