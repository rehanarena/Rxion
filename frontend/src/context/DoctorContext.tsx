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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [docSlots, setDocSlots] = useState<Slot[]>([]);

  const fetchSlots = async (docId: string) => {
    try {
        const response = await axios.get(`${backendUrl}/api/doctor/slot/${docId}`);
        // console.log(`${backendUrl}/api/doctor/slot/${docId}`);
      // console.log("API response:", response.data);
      if (response.data.success) {
        setDocSlots(response.data.slots);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
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
