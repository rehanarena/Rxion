import { Doctor} from '../Interfaces/Doctor'
import { Appointment } from '../Interfaces/Appointment';
export interface AdminContextType {
  aToken: string;
  setAToken: React.Dispatch<React.SetStateAction<string>>;
  backendUrl: string;
  // dashData: DashDataType | false;
  // getDashData: () => Promise<void>;
  doctors: Doctor[];
  getAllDoctors: () => Promise<void>;
  changeAvailability: (docId: string) => Promise<void>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  getAllAppointments: (params?: { search?: string; page?: number; limit?: number }) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  getDoctorDetails: (doctorId: string) => Promise<Doctor | null>;
  updateDoctorPassword: (
    doctorId: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

export interface DashDataType {
  appointments: number;
  earnings: number;
  patients: number;
  latestAppointments: Appointment[];
}