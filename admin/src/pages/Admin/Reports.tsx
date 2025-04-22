import { useContext, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { AdminContext } from "../../context/AdminContext";
import { formatTime } from "../../Helper/formatTime";
import { AppointmentReport } from "../../Interfaces/Appointment";
pdfMake.vfs = pdfFonts.vfs;

export default function AppointmentsReport() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<AppointmentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { aToken } = useContext(AdminContext)!;
  const backendUrl =
    import.meta.env.VITE_NODE_ENV === "PRODUCTION"
      ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
      : import.meta.env.VITE_BACKEND_URL;

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${backendUrl}/api/admin/reports?startDate=${startDate}&endDate=${endDate}`,
        { headers: { atoken: aToken } }
      );
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      if (result.success) setReportData(result.data);
      else setError("Failed to fetch report data.");
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching report data.");
    }

    setLoading(false);
  };

  const handleDownloadPDF = () => {
    /* … your existing PDF-generation code … */
  };

  return (
    // 1) root overflow-x-hidden to kill page scroll
    <div className="overflow-x-hidden min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3">
            Appointments Report
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-4">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search Reports
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={reportData.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Loader & Errors */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-md mb-4">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Table */}
          {reportData.length > 0 ? (
            // 2) internal scroll + hidden scrollbar
            <div className="overflow-x-auto hide-scrollbar rounded-lg shadow-md">
              <table className="table-auto w-full max-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Appointment ID",
                      "Doctor",
                      "Patient",
                      "Date",
                      "Time",
                      "Payment Status",
                      "Fees",
                    ].map((hdr) => {
                      // 3) drop on xs
                      const hideXs = hdr === "Payment Status" || hdr === "Fees"
                        ? "hidden sm:table-cell"
                        : "";
                      return (
                        <th
                          key={hdr}
                          className={`${hideXs} px-2 md:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                        >
                          {hdr}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((r) => (
                    <tr key={r.appointmentId} className="hover:bg-gray-100 transition-colors">
                      <td className="px-2 md:px-6 py-2 break-words text-sm text-gray-900">
                        {r.appointmentId}
                      </td>
                      <td className="px-2 md:px-6 py-2 break-words text-sm text-gray-900">
                        {r.doctor}
                      </td>
                      <td className="px-2 md:px-6 py-2 break-words text-sm text-gray-900">
                        {r.patient}
                      </td>
                      <td className="px-2 md:px-6 py-2 text-sm text-gray-900">{r.date}</td>
                      <td className="px-2 md:px-6 py-2 text-sm text-gray-900">
                        {formatTime(r.time)}
                      </td>
                      <td className="hidden sm:table-cell px-2 md:px-6 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            r.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-2 md:px-6 py-2 text-sm text-gray-900">
                        ₹{r.fees.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-6 bg-gray-100 rounded-md">
                <p className="text-gray-600">
                  No report data available. Please adjust your filters and search again.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
