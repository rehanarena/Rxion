import { Request, Response } from "express";
import { AdminService } from "../services/admin/adminService";
const adminServiceInstance = new AdminService();

interface AddDoctorRequestBody {
  name: string;
  email: string;
  password: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: string;
  address: string;
}
export interface IBookedSlot {
  startTime: string;
  isBooked: boolean;
}


const addDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      res.status(400).json({ success: false, message: "Image file missing" });
      return;
    }

    await adminServiceInstance.addDoctor(data, imageFile);

    res.status(201).json({
      success: true,
      message: "Doctor Added Successfully and Password Sent to Email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { token } = await adminServiceInstance.loginAdmin(email, password);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};


/// Dashboard ///
// adminController.ts

const adminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const dashData = await adminServiceInstance.getDashboardData();
    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};





const userList = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await adminServiceInstance.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};


const blockUnblockUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action } = req.body;
  try {
    const result = await adminServiceInstance.blockUnblockUser(id, action);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      const status = error.message === "User not found" ? 404 : error.message === "Invalid action" ? 400 : 500;
      res.status(status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};


const blockUnblockDoctor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action } = req.body;
  try {
    const result = await adminServiceInstance.blockUnblockDoctor(id, action);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      const status = error.message === "Doctor not found" ? 404 : error.message === "Invalid action" ? 400 : 500;
      res.status(status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

const doctorList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = "1", limit = "8", speciality } = req.query;
    const result = await adminServiceInstance.doctorList({
      search: search as string,
      page: page as string,
      limit: limit as string,
      speciality: speciality as string,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error while fetching doctors." });
  }
};
const allDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await adminServiceInstance.allDoctors();
    res.json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    res.status(500).json({ message: "Server error while fetching doctors." });
  }
};
export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  const { doctorId } = req.params;
  try {
    const doctor = await adminServiceInstance.getDoctor(doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }
    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/// All appointment list ///
const appointmentsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await adminServiceInstance.getAllAppointments();
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching appointments." });
  }
};

/// cancelAppointment ///
const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.body as { appointmentId: string };
    const result = await adminServiceInstance.cancelAppointment(appointmentId);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export {
  addDoctor,
  loginAdmin,
  adminDashboard,
  userList,
  blockUnblockUser,
  blockUnblockDoctor,
  doctorList,
  allDoctors,
  appointmentsAdmin,
  cancelAppointment,
};
