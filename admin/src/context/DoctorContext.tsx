import axios from "axios";
import { useState, createContext, useEffect } from "react";
import { toast } from "react-toastify";
import { Doctor} from '../Interfaces/Doctor'
import { DashDataType } from "../Interfaces/AdminContext";
import { Appointment } from "../Interfaces/Appointment";
import { ProfileData } from "../Interfaces/Doctor";
import { DoctorContextType, DoctorContextProviderProps } from "../Interfaces/Doctor";
export const DoctorContext = createContext<DoctorContextType | undefined>(
  undefined
);



const DoctorContextProvider: React.FC<DoctorContextProviderProps> = (props) => {
  const backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"? import.meta.env.VITE_PRODUCTION_URL_BACKEND: import.meta.env.VITE_BACKEND_URL
  // console.log(backendUrl)
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
      // console.log(dToken)
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
        // console.log(data.dashData);
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
        // console.log("Doctor Data BEFORE state update:", profileData);
        setProfileData(data.profileData); 
        // console.log("Doctor Data AFTER state update:", data.profileData);
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
