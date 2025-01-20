import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import cancel_icon from "../../assets/cancel_icon.svg";
import tick_icon from "../../assets/tick_icon.svg";

interface userData {
  name: string;
  image: string;
  dob: string;
}
interface Appointment {
  _id: string;
  userData: userData;
  amount: number;
  slotDate: string;
  slotTime: string;
  cancelled: boolean;
  payment: boolean;
  isCompleted: boolean;
}
// Define types for the context
interface DoctorContextType {
  dToken: string | null;
  appointments: Appointment[];
  getAppointments: () => void;
  completeAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;
}

interface AppContextType {
  currencySymbol: string;
  slotDateFormat: (date: string) => string;
  calculateAge: (dob: string) => number;
}
const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext) as DoctorContextType;
  const { calculateAge, slotDateFormat, currencySymbol } = useContext(
    AppContext
  ) as AppContextType;

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken, getAppointments]);

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <p className="mb-4 text-xl font-semibold">All Appointments</p>
      <div className="bg-white border rounded-md shadow-md text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_2fr_1fr_1fr] gap-4 py-4 px-6 border-b bg-gray-100 text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.reverse().map((item, index) => (
          <div
            className="flex flex-col sm:grid grid-cols-[0.5fr_2fr_1fr_2fr_1fr_1fr] gap-4 items-center text-gray-600 py-4 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="hidden sm:block font-medium">{index + 1}</p>
            <div className="flex items-center gap-3">
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={item.userData.image}
                alt="Patient"
              />
              <p className="font-medium text-gray-800">{item.userData.name}</p>
            </div>
            <div className="text-xs border border-primary text-primary px-3 py-1 rounded-full">
              <p>{item.payment ? "Online" : "Cash"}</p>
            </div>
            <p className="text-gray-800">
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <p className="font-medium">
              {currencySymbol} {item.amount}
            </p>
            {item.cancelled ? (
              <p className="text-red-500 text-sm font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-sm font-medium">Completed</p>
            ) : (
              <div className="flex gap-2">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-8 h-8 cursor-pointer hover:opacity-80"
                  src={cancel_icon}
                  alt="Cancel Appointment"
                />
                <img
                  onClick={() => completeAppointment(item._id)}
                  className="w-8 h-8 cursor-pointer hover:opacity-80"
                  src={tick_icon}
                  alt="Complete Appointment"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
