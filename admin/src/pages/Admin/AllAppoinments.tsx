import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import cancel_icon from '../../assets/cancel_icon.svg';
import default_user_image from '../../assets/upload_area.svg';

// Define the types
interface UserData {
  image: string;
  name: string;
  dob: string;
}

interface DoctorData {
  image: string;
  name: string;
  speciality: string;
}

interface Appointment {
  _id: string;
  userData: UserData | null;  
  docData: DoctorData | null;
  amount: number;
  slotDate: string;
  slotTime: string;
  cancelled: boolean;
  isCompleted: boolean;
}

interface AdminContextType {
  aToken: string | null;
  appointments: Appointment[];
  getAllAppointments: () => void;
  cancelAppointment: (id: string) => void;
}

interface AppContextType {
  calculateAge: (dob: string) => number;
  slotDateFormat: (date: string) => string;
}

const AllAppointments = () => {
  const adminContext = useContext(AdminContext)as AdminContextType;
  const { calculateAge, slotDateFormat } = useContext(AppContext) as AppContextType;

  // Make sure that adminContext is defined
  if (!adminContext) {
    return <div>Loading...</div>;
  }

  const { aToken, appointments, getAllAppointments, cancelAppointment } = adminContext;

   useEffect(()=>{
    if (aToken) {
      getAllAppointments()
    }
   },[aToken])

  

  return (
    <div className="w-full max-w-6xl mx-auto my-5">
      <p className="mb-3 text-lg font-medium text-center sm:text-left">
        All Appointments
      </p>
      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-auto">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b bg-gray-100 text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fee</p>
          <p>Actions</p>
        </div>

        {/* Table Rows */}
        {appointments.map((item, index) => (
          <div
            className="grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-cols-1 items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50"
            key={item._id}
          >
            {/* Serial Number */}
            <p className="hidden sm:block">{index + 1}</p>

            {/* Patient */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full"
                src={item.userData?.image || default_user_image}
                alt="Patient"
              />
              <p>{item.userData?.name || "Unknown Patient"}</p>
            </div>

            {/* Age */}
            <p className="hidden sm:block">
              {item.userData?.dob && calculateAge(item.userData.dob)}
            </p>

            {/* Date & Time */}
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>

            {/* Doctor */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full bg-gray-200"
                src={item.docData?.image || default_user_image}
                alt="Doctor"
              />
              <p>{item.docData?.name || "Unknown Doctor"}</p>
            </div>

            {/* Fee */}
            <p>{item.amount ? ` ₹ ${item.amount}` : "N/A"}</p>

            {/* Actions */}
            <div>
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-6 sm:w-10 cursor-pointer"
                  src={cancel_icon}
                  alt="Cancel Appointment"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
