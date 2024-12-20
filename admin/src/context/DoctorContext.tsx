import { useState, createContext, ReactNode } from "react";
interface DoctorContextType {
  backendUrl: string;
  dToken: string;
  setDToken: React.Dispatch<React.SetStateAction<string>>;
}

export const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider: React.FC<DoctorContextProviderProps> = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const [dToken, setDToken] = useState<string>(localStorage.getItem("dToken") || "");;

  const value = {
    backendUrl,
    dToken,
    setDToken,
  };

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;
