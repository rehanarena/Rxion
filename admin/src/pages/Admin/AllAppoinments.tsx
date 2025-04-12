import { useContext, useEffect, useState, useCallback } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import debounce from "lodash.debounce";
import cancel_icon from "../../assets/cancel_icon.svg";
import { AdminContextType } from "../../Interfaces/AdminContext";
import { AppContextType } from "../../Interfaces/AppContext";

const AllAppointments = () => {
  const adminContext = useContext(AdminContext);
  if (!adminContext) {
    throw new Error("AdminContext is not available");
  }
  const { aToken, appointments, getAllAppointments, cancelAppointment } = adminContext as AdminContextType;

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error("AppContext is not available");
  }
  const { calculateAge, currencySymbol, slotDateFormat } = appContext as AppContextType;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState("slotDate"); 
  const [sortOrder, setSortOrder] = useState("asc");      

  const itemsPerPage = 10;

  const debouncedFetchAppointments = useCallback(
    debounce((params: { search?: string; page?: number; limit?: number; sortField?: string; sortOrder?: string }) => {
      getAllAppointments(params);
    }, 500) as (params: { search?: string; page?: number; limit?: number; sortField?: string; sortOrder?: string }) => void,
    [getAllAppointments]
  );
  useEffect(() => {
    if (aToken) {
      debouncedFetchAppointments({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
        sortField,
        sortOrder
      });
    }
  }, [aToken, searchTerm, currentPage, itemsPerPage, sortField, sortOrder, debouncedFetchAppointments]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1);
    setSearchTerm(e.target.value);
  };

  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(1);
    setSortField(e.target.value);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(1);
    setSortOrder(e.target.value);
  };

  const currentAppointments = appointments;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (appointments.length === itemsPerPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-5 px-4">
      <p className="mb-5 text-xl font-semibold text-center sm:text-left text-gray-800">
        All Appointments
      </p>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded"
          placeholder="Search by patient name..."
        />
      </div>

      {/* Sorting Controls */}
      <div className="flex gap-4 mb-4">
        <div>
          <label htmlFor="sortField" className="mr-2 text-gray-700">
            Sort Field:
          </label>
          <select id="sortField" value={sortField} onChange={handleSortFieldChange} className="p-2 border rounded">
            <option value="slotDate">Date</option>
            <option value="userData.name">Patient Name</option>
            <option value="amount">Fees</option>
            {/* Add other sort options as required */}
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder" className="mr-2 text-gray-700">
            Order:
          </label>
          <select id="sortOrder" value={sortOrder} onChange={handleSortOrderChange} className="p-2 border rounded">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Appointment List */}
      <div className="bg-white border rounded-lg text-sm shadow-sm max-h-[80vh] overflow-y-auto">
        <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_2fr_2.5fr_1.5fr_1fr_1fr] py-3 px-6 border-b bg-gray-100 text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {currentAppointments.map((item, index) => (
          <div
            key={item._id}
            className="grid sm:grid-cols-[0.5fr_2.5fr_2fr_2.5fr_1.5fr_1fr_1fr] grid-cols-1 items-center py-4 px-6 border-b hover:bg-gray-50"
          >
            <p className="hidden sm:block text-gray-600">
              {index + 1 + ((currentPage - 1) * itemsPerPage)}
            </p>
            <div className="flex items-center gap-3">
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={item.userData.image}
                alt="Patient"
              />
              <p className="text-gray-800 font-medium">{item.userData.name}</p>
            </div>
            <p className="hidden sm:block">{calculateAge(item.userData.dob)}</p>
            <p className="text-gray-600">{slotDateFormat(item.slotDate, item.slotTime)}</p>
            <div className="flex items-center gap-3">
              {item.doctData ? (
                <>
                  <img
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    src={item.doctData.image}
                    alt="Doctor"
                  />
                  <p className="text-gray-800 font-medium">{item.doctData.name}</p>
                </>
              ) : (
                <p className="text-gray-500">Doctor information unavailable</p>
              )}
            </div>
            <p className="text-gray-800 font-semibold">
              {currencySymbol}{item.amount}
            </p>
            <div>
              {item.cancelled ? (
                <p className="text-red-500 text-sm font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-sm font-medium">Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-8 sm:w-10 cursor-pointer hover:opacity-80"
                  src={cancel_icon}
                  alt="Cancel Appointment"
                  title="Cancel Appointment"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end items-center mt-4 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">Page {currentPage}</span>
        <button
          onClick={handleNextPage}
          disabled={appointments.length < itemsPerPage}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllAppointments;
