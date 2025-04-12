import { ReactNode } from 'react'
import { Doctor } from '../Interfaces/Doctor';
import { UserData } from '../Interfaces/User';
export interface AppContextType {
  doctors: Doctor[];
  getDoctorsData: () => void;
  updateDoctorSlots: (doctorId: string, slotDate: string, slotTime: string) => void;
  currencySymbol: string;
  token: string | false;
  setToken: React.Dispatch<React.SetStateAction<string | false>>;
  backendUrl: string;
  userData: UserData | false;
  setUserData: React.Dispatch<React.SetStateAction<UserData | false>>;
  loadUserProfileData: () => void;
  calculateAge: (dob: string) => number;
  slotDateFormat: (slotDate: string, slotTime: string) => string;
  logout: () => void;
}

export interface AppContextProviderProps {
  children: ReactNode;
}