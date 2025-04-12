import { ReactNode } from "react";
import { DashDataType } from "./AdminContext";
import { Appointment } from "../Interfaces/Appointment";

export interface DoctorContextType {
    dToken: string | null;
    doctors: Doctor[];
    getDoctorsData: () => void;
    backendUrl: string;
    setDToken: React.Dispatch<React.SetStateAction<string>>;
    dashData: DashDataType | boolean;
    getDashData: () => Promise<void>;
    profileData: ProfileData | null;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
    getLoggedInDoctor: () => void;
    getAppointments: () => Promise<void>;
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    completeAppointment: (appointmentId: string) => Promise<void>;
    cancelAppointment: (appointmentId: string) => Promise<void>;
  }

  export interface DoctorVideoCallProps {
    roomId: string
  }

 export interface Doctor {
    _id: string;
    name: string;
    email: string;
    image: string;
    degree: string;
    speciality: string;
    isBlocked: boolean;
    available: boolean;
    experience: string;
    about: string;
    fees: number;
    slots_booked: Record<string, string[]> | null;
  }
  
  interface Address {
    line1: string;
    line2: string;
  }
  export interface ProfileData {
    _id: string;
    name: string;
    degree: string;
    speciality: string;
    experience: string;
    about: string;
    fees: number;
    address: Address;
    available: boolean;
    image: string | null;
  }
  
 export  interface Specialty {
    _id: string;
    name: string;
    description: string;
  }
  
  export interface DoctorData {
    image: string;
    name: string;
    speciality: string;
    degree: string;
    fees: number;
  }

  export interface DoctorContextProviderProps {
    children: ReactNode;
  }