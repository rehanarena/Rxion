import { UserData} from '../Interfaces/User'
import { DoctorData, Doctor } from '../Interfaces/Doctor';
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

 export interface AppointmentReport {
    appointmentId: string;
    doctor: string;
    patient: string;
    date: string;
    time: string;
    paymentStatus: string;
    fees: number;
  }