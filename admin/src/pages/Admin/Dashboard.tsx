import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import doctor_icon from "../../assets/doctor_icon.svg";
import patients_icon from "../../assets/patients_icon.svg";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

interface DashDataType {
  appointments: number;
  doctors: number;
  patients: number;
  appointmentChartData?: {
    labels: string[];
    data: number[];
  };
}

interface UserData {
  name: string;
  image: string;
}

interface Appointment {
  _id: string;
  slotTime: string; // e.g. "2025-03-15T09:30:00.000Z"
  userData: UserData;
}

interface AdminContextType {
  aToken: string | null;
  getDashData: () => Promise<void>;
  dashData: DashDataType | null;
  appointments: Appointment[];
  getAllAppointments: () => void;
}

const Dashboard: React.FC = () => {
  const { aToken, getDashData, dashData, appointments, getAllAppointments } =
    useContext(AdminContext) as AdminContextType;

  useEffect(() => {
    if (aToken) {
      getDashData();
      getAllAppointments();
    }
  }, [aToken]);

  if (!dashData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">Loading dashboard data...</p>
      </div>
    );
  }

  // Get the first 7 upcoming appointments
  const upcomingAppointments = appointments.slice(0, 7);

  // Helper function to convert an ISO date/time string to a readable local format
  const formatLocalDateTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date/time";
    }
    return dateObj.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Chart data for Doctors vs Patients Doughnut Chart
  const doughnutChartData = {
    labels: ["Doctors", "Patients"],
    datasets: [
      {
        data: [dashData.doctors, dashData.patients],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Chart data for Appointments Trend (line chart)
  const lineChartData = {
    labels: dashData.appointmentChartData?.labels || [],
    datasets: [
      {
        label: "Appointments",
        data: dashData.appointmentChartData?.data || [],
        fill: false,
        borderColor: "#4BC0C0",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-4 bg-white p-6 min-w-[200px] rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-transform transform hover:scale-105">
          <img className="w-16" src={doctor_icon} alt="Doctor Icon" />
          <div>
            <p className="text-2xl font-semibold text-gray-700">{dashData.doctors}</p>
            <p className="text-gray-500">Doctors</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-6 min-w-[200px] rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-transform transform hover:scale-105">
          <img className="w-16" src={patients_icon} alt="Patients Icon" />
          <div>
            <p className="text-2xl font-semibold text-gray-700">{dashData.patients}</p>
            <p className="text-gray-500">Patients</p>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-gray-500 text-lg">No upcoming appointments</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={appointment.userData.image}
                    alt={`${appointment.userData.name}'s avatar`}
                  />
                  <p className="text-lg font-medium text-gray-800">
                    {appointment.userData.name}
                  </p>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">Time:</span> {formatLocalDateTime(appointment.slotTime)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Doctors vs Patients
          </h2>
          <div className="relative h-72">
            <Doughnut data={doughnutChartData} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Appointments Trend (Next 7 Days)
          </h2>
          {lineChartData.labels.length ? (
            <div className="relative h-72">
              <Line data={lineChartData} />
            </div>
          ) : (
            <p className="text-gray-500 text-lg">No appointment trend data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
