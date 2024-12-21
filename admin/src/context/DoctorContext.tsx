import axios from "axios";
import { useState, createContext, ReactNode } from "react";
import { toast } from "react-toastify";

interface DashDataType {
  appointments: number;
  earnings: number;
  patients: number;
}

interface DoctorContextType {
  backendUrl: string;
  dToken: string;
  setDToken: React.Dispatch<React.SetStateAction<string>>;
  dashData: DashDataType | boolean;
  getDashData: () => Promise<void>;
}

export const DoctorContext = createContext<DoctorContextType | undefined>(
  undefined
);

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider: React.FC<DoctorContextProviderProps> = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState<string>(
    localStorage.getItem("dToken") ?? ""
  );
  const [dashData, setDashData] = useState<DashDataType | boolean>(false);

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

  const value = {
    backendUrl,
    dToken,
    setDToken,
    dashData,
    getDashData,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
