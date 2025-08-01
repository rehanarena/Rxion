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
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = new this.model(data);
            return yield doc.save();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).exec();
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(query).exec();
        });
    }
    find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find(query).exec();
        });
    }
    count() {
        return __awaiter(this, arguments, void 0, function* (query = {}) {
            return yield this.model.countDocuments(query).exec();
        });
    }
    updateById(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, update, { new: true }).exec();
        });
    }
    updateOne(query_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (query, update, options = { new: true, upsert: false }) {
            return yield this.model.findOneAndUpdate(query, update, options).exec();
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.findByIdAndDelete(id).exec();
        });
    }
    deleteOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.deleteOne(query).exec();
        });
    }
}
exports.BaseRepository = BaseRepository;
