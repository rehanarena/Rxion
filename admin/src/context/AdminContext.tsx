import { createContext, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  available: boolean;
}

interface DashDataType {
  appointments: number;
  doctors: number;
  patients: number;
}

interface AdminContextType {
  aToken: string;
  setAToken: React.Dispatch<React.SetStateAction<string>>;
  backendUrl: string;
  dashData: DashDataType | boolean;
  getDashData: () => Promise<void>;
  doctors: Doctor[]; 
  getAllDoctors: () => Promise<void>;
  changeAvailability: (docId: string) => Promise<void>;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminContextProviderProps {
  children: ReactNode;
}

const AdminContextProvider: React.FC<AdminContextProviderProps> = (props) => {
  const [aToken, setAToken] = useState<string>(localStorage.getItem("aToken") ?? "");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState<Doctor[]>([]); 
  const [dashData, setDashData] = useState<DashDataType | boolean>(false);

  const getDashData = async (): Promise<void> => {
    if (dashData !== false) {
      return;
    }
    try {
      const { data } = await axios.get<{ success: boolean, dashData: DashDataType, message: string }>(
        `${backendUrl}/api/admin/dashboard`,
        { headers: { aToken } }
      );

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

  const getAllDoctors = async (): Promise<void> => {
    try {
      const { data } = await axios.post<{ success: boolean, doctors: Doctor[], message: string }>(
        `${backendUrl}/api/admin/all-doctors`,
        {},
        { headers: { aToken } }
      );

      if (data.success) {
        setDoctors(data.doctors);
        console.log(data.doctors);
        
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const changeAvailability = async (docId:string): Promise<void> =>{
    try {
      const {data} = await axios.post( backendUrl+'/api/admin/change-availability',{docId},{headers:{aToken}})
      if (data.success) {
        toast.success(data.message)
        getAllDoctors()
      }else{
        toast.error(data.message)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }

  }

  const value: AdminContextType = {
    aToken,
    setAToken,
    backendUrl,
    dashData,
    getDashData,
    doctors,
    getAllDoctors,
    changeAvailability,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
