import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  available: boolean;
}

const Doctors: React.FC = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { speciality } = useParams<{ speciality: string }>();
  const [filterDoc, setFilterDoc] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "speciality" | "availability">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);  
  const [doctorsPerPage] = useState(8);

  const navigate = useNavigate();
  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/user/doctors?speciality=${speciality || ""}&search=${searchTerm}&sortBy=${sortBy}&page=${currentPage}&limit=8`
      );
  
      const data = await response.json();
      setFilterDoc(data.doctors);
      setTotalPages(data.totalPages);
  
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };
  
  useEffect(() => {
    fetchDoctors();
  }, [speciality, searchTerm, sortBy, currentPage]);
 

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filterDoc.slice(indexOfFirstDoctor, indexOfLastDoctor);


  return (
    <div className="container mx-auto px-4 py-6">
      <p className="text-gray-600 text-lg mb-5">Browse through the doctors' specialties.</p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "speciality" | "availability")}
          className="border border-gray-300 rounded px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="name">Sort by Name</option>
          <option value="speciality">Sort by Speciality</option>
          <option value="availability">Sort by Availability</option>
        </select>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentDoctors.map((item) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              scrollTo(0, 0);
            }}
            className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-all duration-300 shadow-lg hover:shadow-2xl"
            key={item._id}
          >
            <img className="w-full h-[200px] object-cover" src={item.image} alt={item.name} />
            <div className="p-5">
              <div className={`flex items-center gap-2 text-sm ${item.available ? "text-green-500" : "text-red-500"}`}>
                <p className={`w-2 h-2 ${item.available ? "bg-green-500" : "bg-red-500"} rounded-full`}></p>
                {item.available ? <p>Available</p> : <p>Not available</p>}
              </div>
              <p className="text-gray-900 text-lg font-medium mt-2">{item.name}</p>
              <p className="text-gray-600 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

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
            className={`px-4 py-2 rounded ${currentPage === index + 1 ? "bg-indigo-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
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
