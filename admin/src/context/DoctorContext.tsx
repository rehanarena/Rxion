import { createContext, ReactNode } from "react";

export const DoctorContext = createContext<Record<string, unknown>>({});

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider: React.FC<DoctorContextProviderProps> = ({ children }) => {
  const value: Record<string, unknown> = {};
  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
