import { UserData } from "../User/user";
import { Doctor, DoctorData} from "../Doctor/doctor"
export interface AppointmentOptions {
  search: string;
  sortField: string;
  sortOrder: string;
  page: number;
  limit: number;
}

export interface Appointment {
  _id: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: UserData;
  docData: Doctor;
  doctData?: DoctorData; 
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isCompleted?: boolean;
}