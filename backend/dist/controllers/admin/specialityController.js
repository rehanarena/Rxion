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
exports.SpecialityController = void 0;
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
class SpecialityController {
    constructor(specialityService) {
        this.specialityService = specialityService;
    }
    addSpecialty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, description } = req.body;
                const result = yield this.specialityService.addSpecialty({ name, description });
                if (result.message === 'Specialty added successfully!') {
                    res.status(statusCode_1.default.CREATED).json({ success: true, message: result.message });
                }
                else {
                    res.status(statusCode_1.default.BAD_REQUEST).json({ success: false, message: result.message });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    getSpecialties(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const specialties = yield this.specialityService.getSpecialties();
                res.status(statusCode_1.default.OK).json({ success: true, specialties });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    deleteSpecialty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { specialtyId } = req.params;
                yield this.specialityService.deleteSpecialty(specialtyId);
                res.status(statusCode_1.default.OK).json({ success: true, message: 'Specialty deleted successfully' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    editSpecialty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { specialtyId } = req.params;
                const { name, description } = req.body;
                const updatedSpecialty = yield this.specialityService.editSpecialty(specialtyId, { name, description });
                res.status(statusCode_1.default.OK).json({
                    success: true,
                    message: 'Specialty updated successfully',
                    specialty: updatedSpecialty,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
}
exports.SpecialityController = SpecialityController;
