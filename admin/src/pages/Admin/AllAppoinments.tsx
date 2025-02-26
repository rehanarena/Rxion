import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import cancel_icon from "../../assets/cancel_icon.svg";

interface AdminContextType {
  aToken: string;
  appointments: Appointment[];
  getAllAppointments: () => void;
  cancelAppointment: (id: string) => void;
}

interface DoctorData {
  image: string;
  name: string;
  speciality: string;
  degree: string;
  fees: number;
}

interface UserData {
  name: string;
  image: string;
  dob: string;
}

interface Appointment {
  _id: string;
  doctData: DoctorData;
  userData: UserData;
  amount: number;
  slotDate: string;
  slotTime: string;
  cancelled: boolean;
  isCompleted: boolean;
}

interface AppContextType {
  slotDateFormat: (date: string) => string;
  currencySymbol: string;
  calculateAge: (dob: string) => number;
}

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext) as AdminContextType;
  const { calculateAge, currencySymbol } = useContext(AppContext) as AppContextType;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken, getAllAppointments]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (indexOfLastItem < appointments.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Human readable date & time formatting
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
    return `${dateObj.toLocaleDateString(undefined, dateOptions)} ${dateObj.toLocaleTimeString(undefined, timeOptions)}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-5 px-4">
      <p className="mb-5 text-xl font-semibold text-center sm:text-left text-gray-800">
        All Appointments
      </p>
      <div className="bg-white border rounded-lg text-sm shadow-sm max-h-[80vh] overflow-y-auto">
        {/* Updated grid template to include 7 columns */}
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
            className="grid sm:grid-cols-[0.5fr_2.5fr_2fr_2.5fr_1.5fr_1fr_1fr] grid-cols-1 items-center py-4 px-6 border-b hover:bg-gray-50"
            key={item._id}
          >
            <p className="hidden sm:block text-gray-600">
              {index + 1 + indexOfFirstItem}
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
            <p className="text-gray-600">
              {formatDateTime(item.slotDate, item.slotTime)}
            </p>
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
              {currencySymbol}
              {item.amount}
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
        <span className="text-gray-700">
          Page {currentPage} of {Math.ceil(appointments.length / itemsPerPage)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={indexOfLastItem >= appointments.length}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllAppointments;
