import { useState, createContext, ReactNode, useEffect } from "react";
import axios from "axios";

interface Slot {
  _id: string;
  docId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface DoctorContextType {
  backendUrl: string;
  docSlots: Slot[];
  fetchSlots: (docId: string) => void;
}

export const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

const DoctorContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"? import.meta.env.VITE_PRODUCTION_URL_BACKEND: import.meta.env.VITE_BACKEND_URL
  const [docSlots, setDocSlots] = useState<Slot[]>([]);

  const fetchSlots = async (docId: string): Promise<void> => {
    try {
        const response = await axios.get(`${backendUrl}/api/doctor/slot/${docId}`);
      if (response.data.success) {
        setDocSlots(response.data.slots);
        console.log(response.data.slots) 
      } else {
        console.error("Fetch slots failed:", response.data.message);
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (docSlots.length > 0) {
        // console.log("Fetched slots:", docSlots);
      }
  }, [docSlots]);

  const value = {
    backendUrl,
    docSlots,
    fetchSlots,
  };

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;
