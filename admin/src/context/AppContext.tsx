import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Define types for the context
interface Doctor {
  _id: string;
  name: string;
  image: string;
  degree: string;
  speciality: string;
  experience: string;
  about: string;
  fees: number;
  slots_booked: Record<string, string[]> | null;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
}

interface AppContextType {
  doctors: Doctor[];
  getDoctorsData: () => void;
  currencySymbol: string;
  token: string | false;
  setToken: React.Dispatch<React.SetStateAction<string | false>>;
  backendUrl: string;
  userData: UserData | false;
  setUserData: React.Dispatch<React.SetStateAction<UserData | false>>;
  loadUserProfileData: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = (props) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [token, setToken] = useState<string | false>(
    localStorage.getItem("token") ?? false // Handle null case by falling back to false
  );
  const [userData, setUserData] = useState<UserData | false>(false);

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/get-profile', {
        headers: { token }
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
        logout(); // Add a logout function if the token is invalid or expired
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const getDoctorsData = async () => {
    try {
      console.log(backendUrl + "/api/doctor/list");
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const logout = () => {
    setToken(false);
    setUserData(false);
    localStorage.removeItem("token");
    toast.info("Logged out due to invalid or expired session");
  };

  const value: AppContextType = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
