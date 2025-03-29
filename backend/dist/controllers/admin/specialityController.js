"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.editSpecialty = exports.deleteSpecialty = exports.getSpecialties = exports.addSpecialty = void 0;
const specialtyService = __importStar(require("../../services/admin/specialityService"));
const statusCode_1 = __importDefault(require("../../utils/statusCode"));
const addSpecialty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const result = yield specialtyService.addSpecialty({ name, description });
        if (result.message === 'Specialty added successfully!') {
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
exports.addSpecialty = addSpecialty;
const getSpecialties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("GET /specialties called");
        const specialties = yield specialtyService.getSpecialties();
        res.status(statusCode_1.default.OK).json({ success: true, specialties });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.getSpecialties = getSpecialties;
const deleteSpecialty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { specialtyId } = req.params;
        yield specialtyService.deleteSpecialty(specialtyId);
        res.status(statusCode_1.default.OK).json({ success: true, message: 'Specialty deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.deleteSpecialty = deleteSpecialty;
const editSpecialty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { specialtyId } = req.params;
        const { name, description } = req.body;
        const updatedSpecialty = yield specialtyService.editSpecialty(specialtyId, { name, description });
        res.status(statusCode_1.default.OK).json({
            success: true,
            message: 'Specialty updated successfully',
            specialty: updatedSpecialty,
        });
    }
    catch (error) {
        console.error(error);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});
exports.editSpecialty = editSpecialty;
