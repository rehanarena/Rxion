import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

interface Address {
  line1: string;
  line2: string;
}

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  available: boolean;
  address?: Address;
}

const Doctors: React.FC = () => {
  const { speciality } = useParams<{ speciality: string }>();
  const [filterDoc, setFilterDoc] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "speciality" | "availability">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(8);
  const [isLocationInputVisible, setIsLocationInputVisible] = useState(false); // State to toggle location input visibility

  const { doctors } = useContext(AppContext) as { doctors: Doctor[] };
  const navigate = useNavigate();

  const applyFilter = () => {
    let filtered = doctors;

    if (speciality) {
      filtered = filtered.filter((doc) => doc.speciality === speciality);
    }

    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationTerm) {
      filtered = filtered.filter((doc) =>
        doc.address?.line1.toLowerCase().includes(locationTerm.toLowerCase()) ||
        doc.address?.line2.toLowerCase().includes(locationTerm.toLowerCase())
      );
    }

    if (sortBy === "availability") {
      filtered = filtered.filter((doc) => doc.available);
    }

    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "speciality") {
      filtered.sort((a, b) => a.speciality.localeCompare(b.speciality));
    } else if (sortBy === "availability") {
      filtered.sort((a, b) => Number(b.available) - Number(a.available));
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchTerm, locationTerm, sortBy]);

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filterDoc.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filterDoc.length / doctorsPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <p className="text-gray-600 text-lg mb-5">
        Browse through the doctors' specialties.
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto transition-all focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute top-2 right-4 text-gray-500">🔍</span>
        </div>

        <div className="relative">
          {/* Location Search Icon */}
          <button
            onClick={() => setIsLocationInputVisible(!isLocationInputVisible)}
            className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 focus:outline-none"
          >
            <span className="text-gray-500 text-xl">📍</span> {/* Location Icon */}
          </button>

          {/* Location Input */}
          {isLocationInputVisible && (
            <input
              type="text"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              placeholder="Search by location..."
              className="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto mt-2 transition-all focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "name" | "speciality" | "availability")
          }
          className="border border-gray-300 rounded px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="name">Sort by Name</option>
          <option value="speciality">Sort by Speciality</option>
          <option value="availability">Sort by Availability</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <div className="flex flex-col gap-4 text-sm text-gray-600 w-full sm:w-[20%]">
          {["General Physician", "Gynecologist", "Dermatologist", "Neurologist", "Gastroenterologist"].map((spec) => (
            <p
              key={spec}
              onClick={() =>
                speciality === spec
                  ? navigate("/doctors")
                  : navigate(`/doctors/${spec.replace(" ", "-")}`)
              }
              className={`w-full py-2 border-b-2 border-gray-300 cursor-pointer hover:bg-indigo-100 rounded transition-all ${speciality === spec ? "bg-indigo-100 text-black" : ""}`}
            >
              {spec}
            </p>
          ))}
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
                {item.address ? (
                  <p className="text-gray-600 text-sm">
                    {item.address.line1}, {item.address.line2}
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">Address not available</p>
                )}
              </div>
            </div>
          ))}
        </div>
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
