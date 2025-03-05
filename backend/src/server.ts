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

// App configuration
const app: Application = express(); 
const port: number = parseInt(process.env.PORT || '4000', 10);

// Connect to the database and cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API endpoints
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/doctor', doctorRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("API Working");
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } // In production, restrict to your app URLs
});

// Global store for active calls
const activeCalls: { [room: string]: any } = {};

// Socket.IO events for call signaling
io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // If there's an active call in this room, immediately send it to the new socket.
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
    // console.log("Make-answer event:", data);
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

  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});
