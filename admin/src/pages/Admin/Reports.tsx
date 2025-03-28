"use client";
import { useState } from "react";

interface AppointmentReport {
  appointmentId: string;
  doctor: string;
  patient: string;
  date: string;
  time: string;
  paymentStatus: string;
  fees: number;
}

export default function AppointmentsReport() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<AppointmentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"? import.meta.env.VITE_PRODUCTION_URL_BACKEND: import.meta.env.VITE_BACKEND_URL

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/reports?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
      } else {
        setError("Failed to fetch report data.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching report data.");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Appointments Report</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label className="block mb-1">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>
      {loading && <p>Loading report...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {reportData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Appointment ID</th>
                <th className="py-2 px-4 border">Doctor</th>
                <th className="py-2 px-4 border">Patient</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Time</th>
                <th className="py-2 px-4 border">Payment Status</th>
                <th className="py-2 px-4 border">Fees</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((report) => (
                <tr key={report.appointmentId} className="text-center">
                  <td className="py-2 px-4 border">{report.appointmentId}</td>
                  <td className="py-2 px-4 border">{report.doctor}</td>
                  <td className="py-2 px-4 border">{report.patient}</td>
                  <td className="py-2 px-4 border">{report.date}</td>
                  <td className="py-2 px-4 border">{report.time}</td>
                  <td className="py-2 px-4 border">{report.paymentStatus}</td>
                  <td className="py-2 px-4 border">{report.fees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No report data available. Please adjust your filters and search again.</p>
      )}
    </div>
  );
}
