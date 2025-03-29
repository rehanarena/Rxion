import { Socket, Server } from "socket.io";
import ChatMessage, { IChatMessage } from "../models/ChatModel";

interface ChatFile {
  url: string;
  type: string;
  fileName: string;
}

interface UserStatus {
  online: boolean;
  lastSeen?: Date;
}

const userStatus: { [userId: string]: UserStatus } = {};

export function chatHandler(socket: Socket, io: Server) {
  /**
   * USER CONNECTS
   * - Update the user's status to online
   */
  socket.on("user-online", (userId: string) => {
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
  socket.on("join-chat", async (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined chat room ${room}`);

    try {
      const messages = await ChatMessage.find({ room }).sort({ timestamp: 1 });
      socket.emit("chat-history", messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      socket.emit("chat-history", []);
    }
  });

  /**
   * SEND-MESSAGE
   */
  socket.on(
    "send-message",
    async (data: {
      room: string;
      message: string;
      sender: string;
      patientName?: string;
      patientImage?: string;
      file?: ChatFile;
    }) => {
      console.log("Received message data:", data);
      const { room, message, sender, file, patientName, patientImage } = data;
      const msg: Partial<IChatMessage> = {
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
        const savedMsg = await ChatMessage.create(msg);
        console.log("Saved message:", savedMsg);
        io.to(room).emit("receive-message", savedMsg);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  );

  /**
   * READ-MESSAGES
   */
  socket.on("read-messages", async (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    try {
      const updateResult = await ChatMessage.updateMany(
        { room, sender: { $ne: sender }, read: false },
        { $set: { read: true } }
      );
      console.log(
        `Messages in room ${room} marked as read by ${sender}. Updated:`,
        updateResult
      );
      io.to(room).emit("messages-read", { room, sender });
    } catch (error) {
      console.error("Error updating read messages:", error);
    }
  });

  /**
   * GET-CHAT-HISTORY
   */
  socket.on("get-chat-history", async () => {
    try {
      const summaries = await ChatMessage.aggregate([
        { $sort: { timestamp: -1 } },
        { $group: { _id: "$room", latestMessage: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$latestMessage" } },
      ]);
      console.log("Emitting chat history summary:", summaries);
      socket.emit("chat-history", summaries);
    } catch (error) {
      console.error("Error fetching chat history summary:", error);
      socket.emit("chat-history", []);
    }
  });

  /**
   * TYPING / STOP-TYPING
   */
  socket.on("typing", (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    socket.to(room).emit("typing", { sender });
  });

  socket.on("stop-typing", (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    socket.to(room).emit("stop-typing", { sender });
  });
}
