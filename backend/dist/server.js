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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const mongodb_1 = __importDefault(require("./config/mongodb"));
const cloudinary_1 = __importDefault(require("./config/cloudinary"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const doctorRoute_1 = __importDefault(require("./routes/doctorRoute"));
const errorHandler_1 = require("./middlewares/errorHandler");
const fs_1 = __importDefault(require("fs"));
const rfs = __importStar(require("rotating-file-stream"));
const path_1 = __importDefault(require("path"));
const videoCallHandlers_1 = require("./socket/videoCallHandlers");
const chatHandlers_1 = require("./socket/chatHandlers");
const frontendUrl_1 = require("./config/frontendUrl");
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || "4000", 10);
const logDirectory = path_1.default.join(__dirname, `logs`);
if (!fs_1.default.existsSync(logDirectory)) {
    fs_1.default.mkdirSync(logDirectory);
}
const errorLogstream = rfs.createStream("error.log", {
    interval: `1d`,
    path: logDirectory,
    maxFiles: 7,
});
(0, mongodb_1.default)();
(0, cloudinary_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [frontendUrl_1.link_one, frontendUrl_1.link_two],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "token",
        "atoken",
        "dtoken",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
// app.use(logger("dev"));
app.use((0, morgan_1.default)("combined", {
    stream: errorLogstream,
    skip: (req, res) => res.statusCode < 400,
}));
// Routes
app.use("/api/admin", adminRoute_1.default);
app.use("/api/user", userRoute_1.default);
app.use("/api/doctor", doctorRoute_1.default);
app.get("/", (req, res) => {
    res.send("API Working");
});
const uploadDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use(errorHandler_1.errorHandler);
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "*" },
});
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    (0, videoCallHandlers_1.videoCallHandler)(socket, io);
    (0, chatHandlers_1.chatHandler)(socket, io);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
