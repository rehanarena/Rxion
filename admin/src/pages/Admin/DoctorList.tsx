import {  useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';


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
  const { aToken } = useContext(AdminContext)as AdminContextType; 
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [doctorsPerPage] = useState<number>(10);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
      const fetchDoctors = async () => {
        if (!aToken) {
          setError('Not Authorized. Please login.');
          setLoading(false);
          return;
        }
        try {
          // Ensure you are hitting the correct doctors endpoint
          const response = await axios.get(`${backendUrl}/api/admin/doctors`, {
            headers: {
              atoken: aToken,  
            },
          });
      
          // Ensure the response data contains an array of doctors
          if (Array.isArray(response.data)) {
            setDoctors(response.data);
          } else {
            setError('Received data is not in the expected format.');
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            setError(error.response.data.message || 'Error fetching doctors.');
          } else {
            setError('Error fetching doctors.');
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchDoctors();
    }, [aToken, backendUrl]);



  const handleBlockUnblockDoctor = async (doctorId: string, action: 'block' | 'unblock') =>  {
    try {
      if (!aToken) {
        setError('Not Authorized. Please login.');
        return;
      }
      await axios.patch(
        `${backendUrl}/api/admin/doctors/block-unblock/${doctorId}`,
        { action },
        { headers: { atoken: aToken } }
      );
      setDoctors(doctors.map(doctor =>
        doctor._id === doctorId ? { ...doctor, isBlocked: action === 'block' } : doctor
      ));
    } catch (error) {
      setError('Error blocking/unblocking doctor.');
      console.error('Error blocking/unblocking doctor:', error);
    }
  };


  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto p-6">
    <h1 className="text-3xl font-semibold mb-6">Doctor List</h1>
    {loading && <p className="text-gray-500">Loading doctors...</p>}
    {error && <p className="text-red-500">{error}</p>}

    {currentDoctors.length === 0 && !loading ? (
      <p className="text-gray-500">No doctors found.</p>
    ) : (
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">speciality</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDoctors.map((doctor) => (
              <tr key={doctor._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{doctor.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doctor.email}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doctor.speciality}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                    ${doctor.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {doctor.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  <button
                    onClick={() =>
                      handleBlockUnblockDoctor(doctor._id, doctor.isBlocked ? 'unblock' : 'block')
                    }
                    className={`px-4 py-2 rounded-full text-white font-semibold 
                      ${doctor.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {doctor.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600 disabled:bg-gray-300"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300"
            disabled={currentPage * doctorsPerPage >= doctors.length}
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
