"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongodb_1 = __importDefault(require("./config/mongodb"));
const cloudinary_1 = __importDefault(require("./config/cloudinary"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const doctorRoute_1 = __importDefault(require("./routes/doctorRoute"));
const errorHandler_1 = require("./middlewares/errorHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Import socket handlers
const videoCallHandlers_1 = require("./socket/videoCallHandlers");
const chatHandlers_1 = require("./socket/chatHandlers");
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '4000', 10);
(0, mongodb_1.default)();
(0, cloudinary_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routes
app.use('/api/admin', adminRoute_1.default);
app.use('/api/user', userRoute_1.default);
app.use('/api/doctor', doctorRoute_1.default);
app.get("/", (req, res) => {
    res.send("API Working");
});
const uploadDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Add the error handler as the last middleware
app.use(errorHandler_1.errorHandler);
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "*" }
});
io.on('connection', (socket) => {
    console.log("Client connected:", socket.id);
    // Initialize socket event handlers
    (0, videoCallHandlers_1.videoCallHandler)(socket, io);
    (0, chatHandlers_1.chatHandler)(socket, io);
    socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);
    });
});
httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
