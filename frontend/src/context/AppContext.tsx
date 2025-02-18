import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export interface AppContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  backendUrl: string;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  userData: UserData | false;
  setUserData: React.Dispatch<React.SetStateAction<UserData | false>>;
  loadUserProfileData: () => void;
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  getDoctorsData: () => void;
  currencySymbol: string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  speciality: string;
  image: string;
  available: boolean;
  degree: string;
  experience: string;
  about: string;
  fees: number;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken") || null);
  const [userId, setUserId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userData, setUserData] = useState<UserData | false>(false);
  const currencySymbol = '₹';

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const loadUserProfileData = async (): Promise<void> => {
    try {
      const { data } = await axios.get<{ success: boolean; message?: string; userData?: UserData }>(
        backendUrl + '/api/user/get-profile',
        { headers: { token } }
      );
      
      console.log("Response from backend:", data); // Log the data received
  
      if (data.success) {
        setUserData(data.userData || false);
        setUserId(data.userData?._id || null); 
        console.log("userId set to:", data.userData?._id);
      } else {
        toast.error(data.message || 'An error occurred');
      }
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  

  const getDoctorsData = async (): Promise<void> => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  const value = {
    token,
    setToken,
    backendUrl,
    userId,
    setUserId,
    userData,
    setUserData,
    loadUserProfileData,
    doctors,
    setDoctors,
    currencySymbol,
    getDoctorsData,
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
