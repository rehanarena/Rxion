import React, { createContext, ReactNode } from "react";

// Define the type for the context value
interface AppContextValue {
  // Add properties as required, e.g., example: string;
}

// Initialize the context with a default value (if needed)
export const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode; // Type for children prop
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const value: AppContextValue = {}; // Provide an appropriate initial value

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
