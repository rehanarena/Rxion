"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error("Unhandled error:", err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
    });
};
exports.errorHandler = errorHandler;
