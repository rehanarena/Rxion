import React, { createContext, useState, ReactNode } from "react";

// Defining types for the context
interface AdminContextType {
  aToken: string;
  setAToken: (token: string) => void;
  backendUrl: string;
}

// Default values for the context (useful for type inference and testing)
const defaultContext: AdminContextType = {
  aToken: "",
  setAToken: () => {},
  backendUrl: "",
};

// Creating the AdminContext with the defined type
export const AdminContext = createContext<AdminContextType>(defaultContext);

interface AdminContextProviderProps {
  children: ReactNode;
}

const AdminContextProvider: React.FC<AdminContextProviderProps> = ({ children }) => {
  // State for the authentication token
  const [aToken, setAToken] = useState<string>("");
  
  // Backend URL from environment variable (ensure it's available in your environment files)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || ""; // Fallback in case the env variable is missing

  // Context value to be provided
  const value: AdminContextType = {
    aToken,
    setAToken,
    backendUrl,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
