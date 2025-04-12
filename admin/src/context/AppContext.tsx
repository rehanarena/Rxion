import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Doctor } from "../Interfaces/Doctor";
import { UserData } from "../Interfaces/User";
import { AppContextType, AppContextProviderProps } from "../Interfaces/AppContext";

export const AppContext = createContext<AppContextType | undefined>(undefined);



const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"? import.meta.env.VITE_PRODUCTION_URL_BACKEND: import.meta.env.VITE_BACKEND_URL
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [token, setToken] = useState<string | false>(localStorage.getItem("token") || false);
  const [userData, setUserData] = useState<UserData | false>(false);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return isNaN(age) ? 0 : age;
  };

  const slotDateFormat = (slotDate: string, slotTime: string): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dateParts = slotDate.split('-');
    if (dateParts.length !== 3) {
      return "Invalid date";
    }
    const year = dateParts[0];
    const month = months[Number(dateParts[1]) - 1];
    const day = dateParts[2];
  
    const timeObj = new Date(slotTime);
    if (isNaN(timeObj.getTime())) {
      return "Invalid date";
    }
    
    let hours = timeObj.getHours();
    const minutes = timeObj.getMinutes().toString().padStart(2, "0");
  
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; 
    
    const formattedHours = hours.toString().padStart(2, "0");
  
    return `${day} ${month} ${year} at ${formattedHours}:${minutes} ${ampm}`;
  };
  
  
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

  const updateDoctorSlots = async (doctorId: string, slotDate: string, slotTime: string) => {
    try {
      if (!doctorId || !slotDate || !slotTime) {
        toast.error("Invalid slot data.");
        return;
      }
  
      const { data, status } = await axios.patch(
        `${backendUrl}/api/admin/update-slots`, 
        { doctorId, slotDate, slotTime },
        { headers: { token } }
      );
  
      if (status === 404) {
        toast.error("Doctor not found.");
      } else if (data.success) {
        toast.success("Doctor's slots updated successfully");
        getDoctorsData(); 
      } else {
        toast.error(data.message || "An error occurred while updating slots.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast.error("Doctor not found.");
        } else {
          toast.error(error.message || "An error occurred while updating the slot.");
        }
      } else {
        toast.error("An unexpected error occurred.");
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
    updateDoctorSlots,
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
