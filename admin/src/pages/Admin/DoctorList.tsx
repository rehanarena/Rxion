import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  speciality: string;
  isBlocked: boolean;
}

interface AdminContextType {
  aToken: string;
}

const DoctorList = () => {
  const { aToken } = useContext(AdminContext) as AdminContextType;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [doctorsPerPage] = useState<number>(8);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!aToken) {
        setError("Not Authorized. Please login.");
        setLoading(false);
        return;
      }
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: doctorsPerPage.toString(),
        });
        if (searchTerm) {
          queryParams.append("search", searchTerm);
        }
        if (selectedSpeciality) {
          queryParams.append("speciality", selectedSpeciality);
        }

        const response = await axios.get(
          `${backendUrl}/api/admin/doctors?${queryParams.toString()}`,
          { headers: { atoken: aToken } }
        );

        if (response.data.doctors) {
          setDoctors(response.data.doctors);
          setTotalPages(response.data.totalPages);
        } else {
          setError("Received data is not in the expected format.");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.message || "Error fetching doctors.");
        } else {
          setError("Error fetching doctors.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [
    aToken,
    backendUrl,
    currentPage,
    doctorsPerPage,
    searchTerm,
    selectedSpeciality,
  ]);

  const handleBlockUnblockDoctor = async (
    doctorId: string,
    action: "block" | "unblock"
  ) => {
    try {
      if (!aToken) {
        setError("Not Authorized. Please login.");
        return;
      }
      await axios.patch(
        `${backendUrl}/api/admin/doctors/block-unblock/${doctorId}`,
        { action },
        { headers: { atoken: aToken } }
      );
      setDoctors(
        doctors.map((doctor) =>
          doctor._id === doctorId
            ? { ...doctor, isBlocked: action === "block" }
            : doctor
        )
      );
    } catch (error) {
      setError("Error blocking/unblocking doctor.");
      console.error("Error blocking/unblocking doctor:", error);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const specialityOptions = [
    "General Physician",
    "Gynecologist",
    "Dermatologist",
    "Neurologist",
    "Gastroenterologist",
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Doctor List</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by name or email..."
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={selectedSpeciality}
          onChange={(e) => {
            setSelectedSpeciality(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Specialities</option>
          {specialityOptions.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading doctors...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {doctors.length === 0 && !loading ? (
        <p className="text-gray-500">No doctors found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Speciality
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {doctor.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {doctor.email}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {doctor.speciality}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                      ${
                        doctor.isBlocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {doctor.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() =>
                        handleBlockUnblockDoctor(
                          doctor._id,
                          doctor.isBlocked ? "unblock" : "block"
                        )
                      }
                      className={`px-4 py-2 rounded-full text-white font-semibold 
                        ${
                          doctor.isBlocked
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                      {doctor.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600 disabled:bg-gray-300"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
