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
exports.chatHandler = chatHandler;
const ChatModel_1 = __importDefault(require("../models/ChatModel"));
const userStatus = {};
function chatHandler(socket, io) {
    /**
     * USER CONNECTS
     * - Update the user's status to online
     */
    socket.on("user-online", (userId) => {
        // Store the userId on the socket for later reference.
        socket.data.userId = userId;
        userStatus[userId] = { online: true };
        io.emit("user-status", { userId, online: true });
    });
    /**
     * USER DISCONNECTS
     * - Update last seen time
     * - Set online to false
     */
    socket.on("disconnect", () => {
        const userId = socket.data.userId;
        if (userId) {
            userStatus[userId] = { online: false, lastSeen: new Date() };
            io.emit("user-status", { userId, online: false, lastSeen: userStatus[userId].lastSeen });
        }
    });
    /**
     * JOIN-CHAT
     */
    socket.on("join-chat", (room) => __awaiter(this, void 0, void 0, function* () {
        socket.join(room);
        console.log(`Socket ${socket.id} joined chat room ${room}`);
        try {
            const messages = yield ChatModel_1.default.find({ room }).sort({ timestamp: 1 });
            socket.emit("chat-history", messages);
        }
        catch (error) {
            console.error("Error fetching chat history:", error);
            socket.emit("chat-history", []);
        }
    }));
    /**
     * SEND-MESSAGE
     */
    socket.on("send-message", (data) => __awaiter(this, void 0, void 0, function* () {
        console.log("Received message data:", data);
        const { room, message, sender, file, patientName, patientImage } = data;
        const msg = {
            room,
            sender,
            message,
            timestamp: new Date(),
            read: false,
            file: file ? file : undefined,
            patientName: patientName || "",
            patientImage: patientImage || "",
        };
        try {
            const savedMsg = yield ChatModel_1.default.create(msg);
            console.log("Saved message:", savedMsg);
            io.to(room).emit("receive-message", savedMsg);
        }
        catch (error) {
            console.error("Error saving message:", error);
        }
    }));
    /**
     * READ-MESSAGES
     */
    socket.on("read-messages", (data) => __awaiter(this, void 0, void 0, function* () {
        const { room, sender } = data;
        try {
            const updateResult = yield ChatModel_1.default.updateMany({ room, sender: { $ne: sender }, read: false }, { $set: { read: true } });
            console.log(`Messages in room ${room} marked as read by ${sender}. Updated:`, updateResult);
            io.to(room).emit("messages-read", { room, sender });
        }
        catch (error) {
            console.error("Error updating read messages:", error);
        }
    }));
    /**
     * GET-CHAT-HISTORY
     */
    socket.on("get-chat-history", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const summaries = yield ChatModel_1.default.aggregate([
                { $sort: { timestamp: -1 } },
                { $group: { _id: "$room", latestMessage: { $first: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestMessage" } },
            ]);
            console.log("Emitting chat history summary:", summaries);
            socket.emit("chat-history", summaries);
        }
        catch (error) {
            console.error("Error fetching chat history summary:", error);
            socket.emit("chat-history", []);
        }
    }));
    /**
     * TYPING / STOP-TYPING
     */
    socket.on("typing", (data) => {
        const { room, sender } = data;
        socket.to(room).emit("typing", { sender });
    });
    socket.on("stop-typing", (data) => {
        const { room, sender } = data;
        socket.to(room).emit("stop-typing", { sender });
    });
}
