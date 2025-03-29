import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  fees: number;
  experience: string;
  available: boolean;
  address?: {
    line1: string;
    line2: string;
  };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const Doctors: React.FC = () => {
  const backendUrl =
    import.meta.env.VITE_NODE_ENV === "PRODUCTION"
      ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
      : import.meta.env.VITE_BACKEND_URL;
  const { speciality } = useParams<{ speciality: string }>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "availability" | "fees" | "popularity" | "experience">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [doctorsPerPage] = useState(8);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchDoctors = async () => {
    try {
      const queryParams = new URLSearchParams({
        speciality: speciality || "",
        search: debouncedSearchTerm,
        sortBy,
        page: currentPage.toString(),
        limit: doctorsPerPage.toString(),
      });

      const response = await fetch(`${backendUrl}/api/user/doctors?${queryParams.toString()}`);
      const data = await response.json();
      setDoctors(data.doctors);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/specialty`);
      const data = await response.json();
      // Assuming the specialties are stored as an array of strings.
      setSpecialties(data.specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [speciality, debouncedSearchTerm, sortBy, currentPage]);

  useEffect(() => {
    fetchSpecialties();
  }, [backendUrl]);

  return (
    <div className="container mx-auto px-4 py-6">
      <p className="text-gray-600 text-lg mb-5">
        Browse through the doctors' specialties.
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by doctor or specialty..."
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as "availability" | "fees" | "experience");
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="availability">Sort by Availability</option>
          <option value="fees">Sort by Fees</option>
          <option value="experience">Sort by Experience</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-4 text-sm text-gray-600 w-full sm:w-[20%]">
          {specialties.map((spec) => (
            <p
              key={spec}
              onClick={() => {
                if (speciality === spec) {
                  navigate("/doctors");
                } else {
                  navigate(`/doctors/${spec}`);
                }
                setCurrentPage(1);
              }}
              className={`w-full py-2 border-b-2 border-gray-300 cursor-pointer hover:bg-indigo-100 rounded transition-all ${
                speciality?.replace("-", " ") === spec ? "bg-indigo-100 text-black" : ""
              }`}
            >
              {spec}
            </p>
          ))}
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {doctors.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                navigate(`/appointment/${item._id}`);
                scrollTo(0, 0);
              }}
              className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <img
                className="w-full h-[200px] object-cover"
                src={item.image}
                alt={item.name}
              />
              <div className="p-5">
                <div className={`flex items-center gap-2 text-sm ${item.available ? "text-green-500" : "text-red-500"}`}>
                  <p className={`w-2 h-2 ${item.available ? "bg-green-500" : "bg-red-500"} rounded-full`}></p>
                  {item.available ? <p>Available</p> : <p>Not available</p>}
                </div>
                <p className="text-gray-900 text-lg font-medium mt-2">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
                {item.address && (
                  <p className="text-gray-600 text-sm">
                    {item.address.line1}, {item.address.line2}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === index + 1 ? "bg-indigo-500 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Doctors;
