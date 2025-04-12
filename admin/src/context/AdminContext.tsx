import { createContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Doctor } from "../Interfaces/Doctor";
import { Appointment } from "../Interfaces/Appointment";
import { AdminContextType } from "../Interfaces/AdminContext";



export const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminContextProviderProps {
  children: ReactNode;
}

const AdminContextProvider: React.FC<AdminContextProviderProps> = ({ children }) => {
  const [aToken, setAToken] = useState<string>(localStorage.getItem("aToken") ?? "");
  const backendUrl =
    import.meta.env.VITE_NODE_ENV === "PRODUCTION"
      ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
      : import.meta.env.VITE_BACKEND_URL;
  console.log("Backend URL:", backendUrl);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }
  };


  const getAllDoctors = async (): Promise<void> => {
    try {
      const { data } = await axios.post<{
        success: boolean;
        doctors: Doctor[];
        message: string;
      }>(`${backendUrl}/api/admin/all-doctors`, {}, { headers: { aToken } });

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const changeAvailability = async (docId: string): Promise<void> => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getAllAppointments = async (params = {}): Promise<void> => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        {
          headers: { aToken },
          params,
        }
      );
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const cancelAppointment = async (appointmentId: string): Promise<void> => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointment`,
        { appointmentId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };
  const getDoctorDetails = async (doctorId: string): Promise<Doctor | null> => {
    try {
      const { data } = await axios.get<{
        success: boolean;
        doctor: Doctor;
        message: string;
      }>(`${backendUrl}/api/admin/doctor/${doctorId}`, { headers: { aToken } });
      if (data.success) {
        return data.doctor;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const updateDoctorPassword = async (
    doctorId: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { data } = await axios.post<{
        success: boolean;
        message: string;
      }>(`${backendUrl}/api/doctors/${doctorId}/update-password`, { newPassword }, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      return data;
    } catch (error) {
      handleError(error);
      return { success: false, message: "Error updating password" };
    }
  };

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
      getAllAppointments();
    }
  }, [aToken]);

  const value: AdminContextType = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    getDoctorDetails,
    updateDoctorPassword,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContextProvider;
