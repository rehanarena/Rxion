import { createContext, ReactNode, useState } from "react";

interface AppContextType {
  settoken: string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [token] = useState<string>("");
  

  const value: AppContextType = {
    settoken: token, 
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
