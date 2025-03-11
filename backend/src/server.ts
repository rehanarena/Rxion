import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/mongodb';
import connectCloudinary from './config/cloudinary';
import adminRouter from './routes/adminRoute';
import userRouter from './routes/userRoute';
import doctorRouter from './routes/doctorRoute';
import fs from "fs";
import path from "path";

const app: Application = express(); 
const port: number = parseInt(process.env.PORT || '4000', 10);

connectDB();
connectCloudinary();

app.use(express.json());
app.use(cors());

app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/doctor', doctorRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("API Working");
});

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } 
});

const activeCalls: { [room: string]: any } = {};

// Define a type for chat rooms that include metadata
interface ChatRoom {
  patientName: string;
  patientImage: string;
  messages: Array<{ sender: string; message: string; timestamp: Date }>;
}

// Updated chatHistory: each room now stores metadata and messages
const chatHistory: { [room: string]: ChatRoom } = {};

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  // --- Call Signaling Events ---
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    if (activeCalls[roomId]) {
      socket.emit('call-made', activeCalls[roomId]);
    }
  });

  socket.on('call-user', (data) => {
    console.log("Call-user event:", data);
    activeCalls[data.room] = data;
    io.to(data.room).emit('call-made', data);
  });

  socket.on('make-answer', (data) => {
    delete activeCalls[data.room];
    io.to(data.room).emit('answer-made', data);
  });

  socket.on('reject-call', (data) => {
    console.log("Reject-call event:", data);
    delete activeCalls[data.room];
    io.to(data.room).emit('call-declined', { from: socket.id });
  });

  socket.on('end-call', (data) => {
    console.log("End-call event:", data);
    delete activeCalls[data.room];
    io.to(data.room).emit('call-ended', { from: socket.id });
  });

  socket.on('ice-candidate', (data) => {
    io.to(data.room).emit('ice-candidate', data.candidate);
  });

  // --- Chat Messaging Events ---
  socket.on('join-chat', (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined chat room ${room}`);
    // Initialize chat history if not available
    if (!chatHistory[room]) {
      // Initialize with empty metadata; metadata will be updated on first message
      chatHistory[room] = { patientName: "", patientImage: "", messages: [] };
    }
    // Send the existing chat messages to the new client
    socket.emit('chat-history', chatHistory[room].messages);
  });
  
  // Update send-message to accept patientName and patientImage when provided
  socket.on('send-message', (data: { room: string; message: string; sender: string; patientName?: string; patientImage?: string }) => {
    const { room, message, sender, patientName, patientImage } = data;
    console.log("send-message received:", data);
    const msg = { sender, message, timestamp: new Date() };

    // Initialize room if needed
    if (!chatHistory[room]) {
      chatHistory[room] = { 
        patientName: patientName || "", 
        patientImage: patientImage || "", 
        messages: [] 
      };
    } else {
      // Update metadata only if not set yet and if values are provided
      if (!chatHistory[room].patientName && patientName) {
        chatHistory[room].patientName = patientName;
      }
      if (!chatHistory[room].patientImage && patientImage) {
        chatHistory[room].patientImage = patientImage;
      }
    }
    chatHistory[room].messages.push(msg);
    io.to(room).emit('receive-message', msg);
  });

  // Handle "get-chat-history" for the doctor to get the last messages from all rooms
  socket.on('get-chat-history', () => {
    const summary = Object.entries(chatHistory)
      .map(([room, chatRoom]) => {
        if (!chatRoom.messages.length) return null;
        const lastMsg = chatRoom.messages[chatRoom.messages.length - 1];
        return {
          room,
          patientName: chatRoom.patientName,
          patientImage: chatRoom.patientImage,
          message: lastMsg.message,
          timestamp: lastMsg.timestamp,
        };
      })
      .filter(Boolean);

    console.log("Emitting chat history summary:", summary);
    socket.emit('chat-history', summary);
  });

  socket.on('typing', (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    socket.to(room).emit('typing', { sender });
  });

  socket.on('stop-typing', (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    socket.to(room).emit('stop-typing', { sender });
  });

  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});
