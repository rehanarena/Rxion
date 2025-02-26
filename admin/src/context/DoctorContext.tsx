import axios from "axios";
import { useState, createContext, ReactNode, useEffect } from "react";
import { toast } from "react-toastify";

interface DashDataType {
  appointments: number;
  earnings: number;
  patients: number;
}

interface Doctor {
  _id: string;
  name: string;
  image: string;
  degree: string;
  speciality: string;
  experience: string;
  about: string;
  fees: number;
  slots_booked: Record<string, string[]> | null;
}

interface Address {
  line1: string;
  line2: string;
}

export interface ProfileData {
  _id: string;
  name: string;
  degree: string;
  speciality: string;
  experience: string;
  about: string;
  fees: number;
  address: Address;
  available: boolean;
  image: string | null;
}
interface Appointment {
  _id: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  docData: Doctor;
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isCompleted?: boolean;
}
interface DoctorContextType {
  doctors: Doctor[];
  getDoctorsData: () => void;
  backendUrl: string;
  dToken: string;
  setDToken: React.Dispatch<React.SetStateAction<string>>;
  dashData: DashDataType | boolean;
  getDashData: () => Promise<void>;
  profileData: ProfileData | null;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  getLoggedInDoctor: () => void;
  getAppointments: () => Promise<void>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  completeAppointment: (appointmentId: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
}

export const DoctorContext = createContext<DoctorContextType | undefined>(
  undefined
);

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider: React.FC<DoctorContextProviderProps> = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [dToken, setDToken] = useState<string>(
    localStorage.getItem("dToken") ?? ""
  );
  const [dashData, setDashData] = useState<DashDataType | boolean>(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const getDashData = async (): Promise<void> => {
    if (dashData !== false) {
      return;
    }
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const getLoggedInDoctor = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dToken },
      });
      if (data.success && data.profileData) {
        console.log("Doctor Data BEFORE state update:", profileData);
        setProfileData(data.profileData); 
        console.log("Doctor Data AFTER state update:", data.profileData);
      } else {
        toast.error(data.message || "Failed to fetch doctor profile");
      }
    } catch (error) {
      console.log("Error fetching doctor profile:", error);
      toast.error("Failed to fetch doctor profile");
    }
  };

  useEffect(() => {
    if (dToken) {
      getLoggedInDoctor();
    }
  }, [dToken]); 

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } });
      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const completeAppointment = async (appointmentId: string) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/complete-appointment',
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/cancel-appointment',
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  const value = {
    backendUrl,
    dToken,
    setDToken,
    doctors,
    getDoctorsData,
    dashData,
    getDashData,
    profileData,
    setProfileData,
    getLoggedInDoctor,
    getAppointments,
    appointments,
    setAppointments,
    completeAppointment,
    cancelAppointment,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
