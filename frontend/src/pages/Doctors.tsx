import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  available: boolean;
}

const Doctors: React.FC = () => {
  const { speciality } = useParams<{ speciality: string }>();
  const [filterDoc, setFilterDoc] = useState<Doctor[]>([]);

  const { doctors } = useContext(AppContext) as { doctors: Doctor[] };
  const navigate = useNavigate();

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  return (
    <div className="container mx-auto px-4 py-6">
      <p className="text-gray-600 text-lg mb-5">
        Browse through the doctors' specialties.
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <div className="flex flex-col gap-4 text-sm text-gray-600 w-full sm:w-[20%]">
          {['General Physician', 'Gynecologist', 'Dermatologist', 'Neurologist', 'Gastroenterologist'].map((spec) => (
            <p
              key={spec}
              onClick={() =>
                speciality === spec
                  ? navigate('/doctors')
                  : navigate(`/doctors/${spec.replace(" ", "-")}`)
              }
              className={`w-full py-2 border-b-2 border-gray-300 cursor-pointer hover:bg-gray-100 rounded transition-all ${
                speciality === spec ? "bg-indigo-100 text-black" : ""
              }`}
            >
              {spec}
            </p>
          ))}
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filterDoc.map((item) => (
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
                <div
                  className={`flex items-center gap-2 text-sm ${
                    item.available ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <p
                    className={`w-2 h-2 ${
                      item.available ? "bg-green-500" : "bg-red-500"
                    } rounded-full`}
                  ></p>
                  {item.available ? <p>Available</p> : <p>Not available</p>}
                </div>
                <p className="text-gray-900 text-lg font-medium mt-2">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
