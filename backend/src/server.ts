import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb';
import connectCloudinary from './config/cloudinary';
import adminRouter from './routes/adminRoute';
import userRouter from './routes/userRoute';

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

app.get("/", (req, res) => {
  res.send("API Working");
});

// Start the server
app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});
