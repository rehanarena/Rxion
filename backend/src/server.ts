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
import { errorHandler } from './middlewares/errorHandler';
import fs from "fs";
import path from "path";

// Import socket handlers
import { videoCallHandler } from './socket/videoCallHandlers';
import { chatHandler } from './socket/chatHandlers';

const app: Application = express(); 
const port: number = parseInt(process.env.PORT || '4000', 10);

connectDB();
connectCloudinary();

app.use(express.json());
app.use(cors());

app.use(errorHandler);

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

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  // Initialize socket event handlers
  videoCallHandler(socket, io);
  chatHandler(socket, io);


  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});
