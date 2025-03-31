import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AdminContext } from "../../context/AdminContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Metrics {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalEarnings: number;
}

interface RevenueData {
  _id: {
    year: number;
    month?: number;
    day?: number;
    week?: number;
  };
  totalRevenue: number;
}

interface AppointmentStatus {
  _id: {
    status: string;
  };
  count: number;
}

interface PaymentStatus {
  _id: {
    payment: string;
  };
  count: number;
}

interface TopDoctor {
  docId: string;
  name: string;
  totalAppointments: number;
  totalEarnings: number;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalEarnings: 0,
  });
  const backendUrl =
    import.meta.env.VITE_NODE_ENV === "PRODUCTION"
      ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
      : import.meta.env.VITE_BACKEND_URL;
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [statusPieData, setStatusPieData] = useState<AppointmentStatus[]>([]);
  const [paymentPieData, setPaymentPieData] = useState<PaymentStatus[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);
  const [period, setPeriod] = useState<string>("daily");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { aToken } = useContext(AdminContext)!;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          metricsResponse,
          revenueResponse,
          statusResponse,
          paymentResponse,
          topDoctorsResponse,
        ] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/metrics`,{
            headers: {
              atoken: aToken,  
            },}),
          axios.get(`${backendUrl}/api/admin/revenue?period=${period}`,{headers:{aToken}}),
          axios.get(`${backendUrl}/api/admin/appointments-status`,{
            headers: {
              atoken: aToken,  
            },}),
          axios.get(`${backendUrl}/api/admin/appointments-payment`,{
            headers: {
              atoken: aToken,  
            },}),
          axios.get(`${backendUrl}/api/admin/top-doctors`,{
            headers: {
              atoken: aToken,  
            },}),
        ]);

        setMetrics(
          metricsResponse.data || {
            totalPatients: 0,
            totalDoctors: 0,
            totalAppointments: 0,
            totalEarnings: 0,
          }
        );

        setRevenueData(
          Array.isArray(revenueResponse.data) ? revenueResponse.data : []
        );
        setStatusPieData(
          Array.isArray(statusResponse.data) ? statusResponse.data : []
        );
        setPaymentPieData(
          Array.isArray(paymentResponse.data) ? paymentResponse.data : []
        );
        setTopDoctors(
          Array.isArray(topDoctorsResponse.data) ? topDoctorsResponse.data : []
        );

        setIsLoading(false);
      } catch (err) {
        console.error("Dashboard Data Fetch Error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  const lineChartData = {
    labels:
      revenueData.length > 0
        ? revenueData.map((item) => Object.values(item._id).join("-"))
        : ["No Data"],
    datasets: [
      {
        label: "Revenue",
        data:
          revenueData.length > 0
            ? revenueData.map((item) => item.totalRevenue)
            : [0],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.8)",
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const statusChartData = {
    labels:
      statusPieData.length > 0
        ? statusPieData.map((item) => item._id.status)
        : ["No Data"],
    datasets: [
      {
        data:
          statusPieData.length > 0
            ? statusPieData.map((item) => item.count)
            : [1],
        backgroundColor: ["#f87171", "#34d399", "#60a5fa"],
        hoverBackgroundColor: ["#ef4444", "#10b981", "#3b82f6"],
        borderWidth: 0,
      },
    ],
  };

  const paymentChartData = {
    labels:
      paymentPieData.length > 0
        ? paymentPieData.map((item) => item._id.payment)
        : ["No Data"],
    datasets: [
      {
        data:
          paymentPieData.length > 0
            ? paymentPieData.map((item) => item.count)
            : [1],
        backgroundColor: ["#fbbf24", "#a78bfa"],
        hoverBackgroundColor: ["#f59e0b", "#8b5cf6"],
        borderWidth: 0,
      },
    ],
  };

  const topDoctorsData = {
    labels:
      topDoctors.length > 0
        ? topDoctors.map((item) => item.name)
        : ["No Data"],
    datasets: [
      {
        label: "Appointments",
        data:
          topDoctors.length > 0
            ? topDoctors.map((item) => item.totalAppointments)
            : [0],
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        hoverBackgroundColor: "rgba(79, 70, 229, 1)",
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl font-medium text-indigo-700">
            Loading Dashboard...
          </p>
          <p className="text-gray-500 mt-2">
            Fetching the latest healthcare insights
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Dashboard Error
          </h2>
          <p className="text-gray-700 mb-6 px-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white rounded-2xl shadow-lg p-6">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Hospital Management System | Rxion Analytics
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-indigo-50 rounded-xl p-3 shadow">
          <span className="text-sm text-gray-600 mr-2">Last Updated:</span>
          <span className="font-semibold text-indigo-700">
            {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Patients",
            value: metrics.totalPatients.toLocaleString(),
            color: "from-blue-400 to-blue-600",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ),
          },
          {
            title: "Total Doctors",
            value: metrics.totalDoctors.toLocaleString(),
            color: "from-green-400 to-green-600",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ),
          },
          {
            title: "Total Appointments",
            value: metrics.totalAppointments.toLocaleString(),
            color: "from-purple-400 to-purple-600",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            title: "Total Earnings",
            value: `₹${metrics.totalEarnings.toLocaleString()}`,
            color: "from-indigo-400 to-indigo-600",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 duration-300 ease-in-out"
          >
            <div className="flex">
              <div
                className={`w-24 flex items-center justify-center bg-gradient-to-br ${metric.color}`}
              >
                {metric.icon}
              </div>
              <div className="p-5 flex-1">
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  {metric.title}
                </h2>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Line Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 sm:mb-0">
            Revenue Trends
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Period:</span>
            <select
              className="border-2 border-indigo-500 text-indigo-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-indigo-50 font-medium"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {["daily", "weekly", "monthly", "yearly"].map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-64 sm:h-80">
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(79, 70, 229, 0.9)",
                  titleFont: {
                    size: 14,
                    weight: "bold",
                  },
                  bodyFont: {
                    size: 13,
                  },
                  padding: 12,
                  cornerRadius: 8,
                },
              },
              scales: {
                y: {
                  grid: {
                    color: "rgba(156, 163, 175, 0.1)",
                  },
                  ticks: {
                    callback: function(value) {
                      return "₹" + value;
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Appointment Status
          </h2>
          <div className="h-64">
            <Pie
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 20,
                      font: {
                        size: 13,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(55, 65, 81, 0.9)",
                    titleFont: {
                      size: 14,
                      weight: "bold",
                    },
                    bodyFont: {
                      size: 13,
                    },
                    padding: 12,
                    cornerRadius: 8,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Payment Status
          </h2>
          <div className="h-64">
            <Pie
              data={paymentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 20,
                      font: {
                        size: 13,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(55, 65, 81, 0.9)",
                    titleFont: {
                      size: 14,
                      weight: "bold",
                    },
                    bodyFont: {
                      size: 13,
                    },
                    padding: 12,
                    cornerRadius: 8,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Doctors Bar Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Top Doctors by Appointments
        </h2>
        <div className="h-64 sm:h-80">
          <Bar
            data={topDoctorsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(156, 163, 175, 0.1)",
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(79, 70, 229, 0.9)",
                  titleFont: {
                    size: 14,
                    weight: "bold",
                  },
                  bodyFont: {
                    size: 13,
                  },
                  padding: 12,
                  cornerRadius: 8,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 mt-8 pb-6">
        <p>© {new Date().getFullYear()}Rxion Admin Dashboard</p>
      </div>
    </div>
  );
};

export default AdminDashboard;