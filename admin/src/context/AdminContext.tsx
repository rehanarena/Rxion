import { createContext, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
}

export const AdminContext = createContext<AdminContextType | undefined>(
  undefined
);

interface AdminContextProviderProps {
  children: ReactNode;
}

const AdminContextProvider: React.FC<AdminContextProviderProps> = (props) => {
  const [aToken, setAToken] = useState<string>(
    localStorage.getItem("aToken") ?? ""
  );
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dashData, setDashData] = useState<DashDataType | boolean>(false);

  const getDashData = async (): Promise<void> => {
    if (dashData !== false) {
      return;
    }
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { aToken },
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

  const value: AdminContextType = {
    aToken,
    setAToken,
    backendUrl,
    dashData,
    getDashData,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
