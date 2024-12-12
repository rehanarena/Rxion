import { createContext, useState, ReactNode } from "react";

// Define types for the context value
interface AppContextType {
    token: string | null; // Allow null for logout
    setToken: (token: string | null) => void; // Accept null
    backendUrl: string;
}

// Create the context with the defined type
export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
    children: ReactNode;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL ; 
    // console.log("Backend URL:", backendUrl);

    const [token, setToken] = useState<string | null>(null); 

    const value = {
        token,
        setToken,
        backendUrl,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
