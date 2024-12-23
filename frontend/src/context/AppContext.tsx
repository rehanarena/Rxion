import { createContext, useState, ReactNode, useContext } from "react";

interface AppContextType {
  token: string | null; 
  setToken: (token: string | null) => void; 
  backendUrl: string;
  userId: string | null; 
  setUserId: (userId: string | null) => void; 
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // State for token and userId
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const value = {
    token,
    setToken,
    backendUrl,
    userId,
    setUserId, 
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export default AppContextProvider;
