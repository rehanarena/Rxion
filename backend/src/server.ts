import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb';
import connectCloudinary from './config/cloudinary';
import adminRouter from './routes/adminRoute';
import userRouter from './routes/userRoute';
import fs from "fs";
import path from "path";
import doctorRouter from './routes/doctorRoute';

// App configuration
const app: Application = express(); 
const port: number = parseInt(process.env.PORT || '4000', 10);

// Connect to the database
connectDB();
//connect to the cloudinary
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API endpoints
app.use('/api/admin',adminRouter)
app.use('/api/user',userRouter)
app.use('/api/doctor',doctorRouter)

app.get("/", (req, res) => {
  res.send("API Working");
});

//manually upload file
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}



// Start the server
app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});