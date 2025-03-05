import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";

const AllDoctors = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)!;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  const handleImageClick = (doctorId: string) => {
    navigate(`/doctor-details/${doctorId}`);
  };
  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="m-5">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {currentDoctors.map((item) => (
          <div
            className="group border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer"
            key={item._id}
          >
            <img
              onClick={() => handleImageClick(item._id)}
              className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
              src={item.image}
              alt=""
            />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-semibold">{item.name}</p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>
              <div>
                <input
                  onChange={() => changeAvailability(item._id)}
                  className="mt-2 flex items-center gap-1 text-sm"
                  type="checkbox"
                  checked={item.available}
                />
                <p className="text-sm text-gray-700">Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="pagination mt-4 flex justify-center items-center gap-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllDoctors;
