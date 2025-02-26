import { createContext, useState, ReactNode, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export interface AppContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  backendUrl: string;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
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

export interface Doctor {
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

export interface UserData {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken") || null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const currencySymbol = "₹";

  // Load token from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Update axios default headers and localStorage when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Function to load/update user profile data
  const loadUserProfileData = useCallback(async (): Promise<void> => {
    try {
      const { data } = await axios.get<{
        success: boolean;
        message?: string;
        userData?: UserData;
      }>(`${backendUrl}/api/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response from backend:", data);

      if (data.success) {
        setUserData(data.userData || null);
        setUserId(data.userData?._id || null);
      } else {
        toast.error(data.message || "An error occurred");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }, [token, backendUrl]);

  // Function to load doctors data
  const getDoctorsData = async (): Promise<void> => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export default AppContextProvider;
