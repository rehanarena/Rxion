"use client";
import { useContext, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { AdminContext } from "../../context/AdminContext";
pdfMake.vfs = pdfFonts.vfs;

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
      const response = await fetch(
        `${backendUrl}/api/admin/reports?startDate=${startDate}&endDate=${endDate}`,{
          headers: {
            atoken: aToken,  
          },})

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setError("Failed to fetch report data.");
        setLoading(false);
        return;
      }

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

  const handleDownloadPDF = () => {
    // Build the table header and body for the PDF
    const tableBody = [
      [
        { text: "S.no", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Appointment ID", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Doctor", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Patient", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Date", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Time", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Payment Status", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Fees", bold: true, fillColor: "#4a4a4a", color: "white" },
      ],
      ...reportData.map((report, index) => [
        index + 1,
        report.appointmentId,
        report.doctor,
        report.patient,
        report.date,
        report.time,
        report.paymentStatus,
        `₹${report.fees.toFixed(2)}`,
      ]),
    ];

    // Calculate summary values
    const totalAppointments = reportData.length;
    const totalFees = reportData.reduce((sum, report) => sum + report.fees, 0);

    // Define the document structure for the PDF
    const documentDefinition = {
      content: [
        {
          text: "Appointments Report",
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 20],
        },
        {
          text: `Date Range: ${startDate || "N/A"} to ${endDate || "N/A"}`,
          alignment: "left",
          margin: [0, 0, 0, 10],
        },
        {
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          alignment: "left",
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            headerRows: 1,
            widths: [
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: tableBody,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? "#4a4a4a"
                : rowIndex % 2 === 0
                ? "#f2f2f2"
                : "white",
            hLineColor: () => "#aaaaaa",
            vLineColor: () => "#aaaaaa",
          },
        },
        {
          text: "Summary",
          style: "subheader",
          margin: [0, 20, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*"],
            body: [
              [
                {
                  text: "Metric",
                  bold: true,
                  fillColor: "#4a4a4a",
                  color: "white",
                },
                {
                  text: "Value",
                  bold: true,
                  fillColor: "#4a4a4a",
                  color: "white",
                },
              ],
              ["Total Appointments", totalAppointments],
              ["Total Fees Collected", `₹${totalFees.toFixed(2)}`],
            ],
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? "#4a4a4a"
                : rowIndex % 2 === 0
                ? "#f2f2f2"
                : "white",
            hLineColor: () => "#aaaaaa",
            vLineColor: () => "#aaaaaa",
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: "#2d2d2d",
        },
        subheader: {
          fontSize: 14,
          bold: true,
          color: "#2d2d2d",
        },
      },
      defaultStyle: {
        fontSize: 10,
        color: "#333333",
      },
    } as unknown as TDocumentDefinitions;

    // Generate and download the PDF
    pdfMake.createPdf(documentDefinition).download("appointments_report.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3">
          Appointments Report
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end space-x-4">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search Reports
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={reportData.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download PDF
            </button>
          </div>
        </div>

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

        {reportData.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Appointment ID", "Doctor", "Patient", "Date", "Time", "Payment Status", "Fees"].map((header) => (
                    <th 
                      key={header} 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((report) => (
                  <tr key={report.appointmentId} className="hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.appointmentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.doctor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.patient}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {report.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{report.fees.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-6 bg-gray-100 rounded-md">
              <p className="text-gray-600">No report data available. Please adjust your filters and search again.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}