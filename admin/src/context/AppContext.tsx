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
  calculateAge: (dob: string) => number;
  slotDateFormat: (slotDate: string) => string;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [token, setToken] = useState<string | false>(
    localStorage.getItem("token") || false
  );
  const [userData, setUserData] = useState<UserData | false>(false);


  // Calculate age based on date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
  
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return isNaN(age) ? 0 : age; // Ensure no NaN value is returned
  };
  

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate: string): string => {
    const dateArray = slotDate.split('_');
    if (dateArray.length === 3) {
      const day = dateArray[0];
      const month = months[Number(dateArray[1]) - 1]; // Correct month indexing
      const year = dateArray[2];
      return `${day} ${month} ${year}`;
    }
    return "Invalid date"; // Fallback in case of invalid date format
  };

  // Fetch user profile data
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
        logout();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  // Fetch doctors data
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  // Logout functionality
  const logout = () => {
    setToken(false);
    setUserData(false);
    localStorage.removeItem("token");
    toast.info("Logged out due to invalid or expired session");
  };

  // Provide context value
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
    calculateAge,
    slotDateFormat,
    logout,
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
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
