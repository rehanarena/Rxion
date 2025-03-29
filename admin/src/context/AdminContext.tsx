import { createContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  available: boolean;
}

interface UserData {
  _id: string;
  name: string;
  image: string;
  dob: string;
}

export interface Appointment {
  _id: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: UserData;
  docData: Doctor;
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isCompleted?: boolean;
}

// Updated dashboard data type to include additional fields for charts & earnings.
// interface DashDataType {
//   appointments: number;
//   doctors: number;
//   patients: number;
//   earnings: number;
//   monthlyEarnings: number[];
//   appointmentChartData: {
//     labels: string[];
//     data: number[];
//   };
// }

interface AdminContextType {
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
  getAllAppointments: () => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  getDoctorDetails: (doctorId: string) => Promise<Doctor | null>;
  updateDoctorPassword: (
    doctorId: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

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
  // Initially set dashData to false so we know when it's been loaded.
  // const [dashData, setDashData] = useState<DashDataType | false>(false);

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }
  };

  // const getDashData = async (): Promise<void> => {
  //   try {
  //     const { data } = await axios.get(`${backendUrl}/api/admin/dashboardAdmi`, { headers: { aToken } });
  //     console.log("API Response:", data);
  //     console.log(aToken)

  //     console.log('dashdatachecking:',data.dashData)

  //     if (data.success) {
  //       setDashData(data.dashData);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     handleError(error);
  //   }
  // };

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

  const getAllAppointments = async (): Promise<void> => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        { headers: { aToken } }
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

  // New function: Get single doctor's details
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

  // New function: Update doctor's password (and send email)
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
      // getDashData();
      getAllDoctors();
      getAllAppointments();
    }
  }, [aToken]);

  const value: AdminContextType = {
    aToken,
    setAToken,
    backendUrl,
    // dashData,
    // getDashData,
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
