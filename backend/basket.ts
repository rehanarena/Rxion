// import jwt from "jsonwebtoken";
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// dotenv.config();

// const secretKey = process.env.JWT_SECRET as string;

// Function to create an admin token
// const createAdminToken = (email: string, password: string): string => {
//   return jwt.sign({ email, password }, secretKey, { expiresIn: "1h" });
// };




// API for admin login
// const loginAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password }: { email: string; password: string } = req.body;

//     // Validate input
//     if (!email || !password) {
//       res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//       return;
//     }

//     // Check credentials
//     if (
//       email === process.env.ADMIN_EMAIL &&
//       password === process.env.ADMIN_PASSWORD
//     ) {
//       const token = createAdminToken(email, password); // Generate token
//       res.json({
//         success: true,
//         token,
//         message: "Admin login successful",
//       });
//     } else {
//       res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }
//   } catch (error: any) {
//     console.error("Error during admin login:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };