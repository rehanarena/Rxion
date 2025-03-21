import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import earning_icon from '../../assets/earning_icon.svg';
import appoinments_icon from '../../assets/appointments_icon.svg';
import patients_icon from '../../assets/patients_icon.svg';
import list_icon from '../../assets/list_icon.svg';
import cancel_icon from '../../assets/cancel_icon.svg';
import tick_icon from '../../assets/tick_icon.svg';

interface Appointment {
  _id: string;
  slotDate: string;
  cancelled?: boolean;
  isCompleted?: boolean;
  userData: {
    image: string;
    name: string;
  };
}

interface DashDataType {
  appointments: number;
  earnings: number;
  patients: number;
  latestAppointments: Appointment[];
}

interface DoctorContextType {
  dToken: string | null;
  getDashData: () => Promise<void>;
  dashData: DashDataType | boolean; 
  completeAppointment: (appointmentId: string) => void;
  cancelAppointment: (appointmentId: string) => void;
}

const DoctorDashboard: React.FC = () => {
  const doctorContext = useContext(DoctorContext);
  if (!doctorContext) {
    throw new Error("DoctorContext is not available");
  }
  const { dToken, getDashData, dashData, completeAppointment, cancelAppointment } = doctorContext as DoctorContextType;

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken, getDashData]);

  if (typeof dashData !== "object" || dashData === null) {
    return <p className="text-gray-500">Loading dashboard data...</p>;
  }

  return (
    <div className="m-5">
      {/* Dashboard Cards */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={earning_icon} alt="Earnings Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.earnings}</p>
            <p className="text-gray-400">Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={appoinments_icon} alt="Appointments Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.appointments}</p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={patients_icon} alt="Patients Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Appointments Section */}
      <div className="bg-white mt-10">
        <div className="flex items-center gap-2.5 px-4 py-4 rounded-t border">
          <img src={list_icon} alt="List Icon" />
          <p className="font-semibold">Latest Appointments</p>
        </div>
      </div>

      <div className="pt-4 border border-t-0">
        {dashData.latestAppointments.map((item, index) => (
          <div key={index} className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100">
            <img className="rounded-full w-10" src={item.userData.image} alt="User" />
            <div className="flex-1 text-sm">
              <p className="text-gray-800 font-medium">{item.userData.name}</p>
              <p className="text-gray-600">{item.slotDate}</p>
            </div>
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-xs font-medium">Completed</p>
            ) : (
              <div className="flex gap-2">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={cancel_icon}
                  alt="Cancel"
                />
                <img
                  onClick={() => completeAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={tick_icon}
                  alt="Complete"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
