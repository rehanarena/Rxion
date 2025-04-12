import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import logger from "morgan";
import { Server } from 'socket.io';
import connectDB from './config/mongodb';
import connectCloudinary from './config/cloudinary';
import adminRouter from './routes/adminRoute';
import userRouter from './routes/userRoute';
import doctorRouter from './routes/doctorRoute';
import { errorHandler } from './middlewares/errorHandler';
import fs from "fs";
import * as rfs from "rotating-file-stream";
import path from "path";

import { videoCallHandler } from './socket/videoCallHandlers';
import { chatHandler } from './socket/chatHandlers';
import { link_one, link_two } from './config/frontendUrl';

const app: Application = express(); 
const port: number = parseInt(process.env.PORT || '4000', 10);

const logDirectory = path.join(__dirname, `logs`);
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}
const errorLogstream = rfs.createStream("error.log", {
  interval: `1d`,
  path: logDirectory,
  maxFiles: 7,
});

// errorLogstream.write("🔧 Logger test write\n");


connectDB();
connectCloudinary();

app.use(express.json());
app.use(cors({
  origin: [link_one as string, link_two as string],
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
  optionsSuccessStatus: 200,

}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(logger("dev"));
app.use(
  logger("combined", {
    stream: errorLogstream,
    skip: (req: Request, res: Response) => res.statusCode < 400,
  })
);

// Routes
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

app.use(errorHandler);




const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  videoCallHandler(socket, io);
  chatHandler(socket, io);

  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });
});



httpServer.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});
