// Dashboard.tsx
import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import doctor_icon from "../../assets/doctor_icon.svg";
import patients_icon from "../../assets/patients_icon.svg";
import appointment_icon from "../../assets/appointment_icon.svg"; // If you have one
import { AppContext } from "../../context/AppContext";

// Types
interface Appointment {
  _id: string;
  userData: {
    name: string;
    image: string;
    dob: string;
  };
  doctData: {
    name: string;
    image: string;
    // ... other fields
  };
  slotDate: string;
  slotTime: string;
  cancelled: boolean;
  isCompleted: boolean;
}

interface DashDataType {
  doctors: number;
  patients: number;
  latestAppointments: Appointment[];
}

interface AdminContextType {
  dashData: DashDataType | null;
  getDashData: () => Promise<void>;
  // ... other context fields
}

interface AppContextType {
  calculateAge: (dob: string) => number;
  // ... other context fields
}

const Dashboard: React.FC = () => {
  const { dashData, getDashData } = useContext(AdminContext) as AdminContextType;
  const { calculateAge } = useContext(AppContext) as AppContextType;

  useEffect(() => {
    getDashData();
  }, [getDashData]);

  if (!dashData) {
    return <p className="text-gray-500">Loading dashboard data...</p>;
  }

  const { doctors, patients, latestAppointments } = dashData;

  // Helper to format date/time:
  const formatDateTime = (dateString: string, timeString: string) => {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return `${dateObj.toLocaleDateString(undefined, dateOptions)} 
      ${dateObj.toLocaleTimeString(undefined, timeOptions)}`;
  };

  return (
    <div className="m-5 space-y-6">
      {/* Cards for doctors & patients */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={doctor_icon} alt="Doctor Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{doctors}</p>
            <p className="text-gray-400">Doctors</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={patients_icon} alt="Patients Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{patients}</p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Appointments */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Latest Appointments</h2>

        {latestAppointments.length === 0 ? (
          <p className="text-gray-500">No recent appointments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-2 px-3">Patient</th>
                  <th className="py-2 px-3">Age</th>
                  <th className="py-2 px-3">Date & Time</th>
                  <th className="py-2 px-3">Doctor</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestAppointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-2 px-3 flex items-center gap-2">
                      <img
                        src={appointment.userData.image}
                        alt="Patient"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-700">
                        {appointment.userData.name}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {calculateAge(appointment.userData.dob)}
                    </td>
                    <td className="py-2 px-3">
                      {formatDateTime(appointment.slotDate, appointment.slotTime)}
                    </td>
                    <td className="py-2 px-3 flex items-center gap-2">
                      {appointment.doctData && (
                        <img
                          src={appointment.doctData.image}
                          alt="Doctor"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span>
                        {appointment.doctData
                          ? appointment.doctData.name
                          : "N/A"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {appointment.cancelled ? (
                        <span className="text-red-500 font-medium">Cancelled</span>
                      ) : appointment.isCompleted ? (
                        <span className="text-green-500 font-medium">Completed</span>
                      ) : (
                        <span className="text-blue-500 font-medium">Upcoming</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
