import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

// Define the type for the doctor object
interface Doctor {
  _id: string;
  image: string;
  name: string;
  speciality: string;
  available: boolean;
}

const TopDoctors: React.FC = () => {
  const navigate = useNavigate();
  const { doctors } = useAppContext(); 

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">Simply browse through our extensive list of trusted Doctors.</p>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-5 px-3 sm:px-0">
        {doctors.slice(0, 10).map((item: Doctor, index: number) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              scrollTo(0, 0);
            }}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-300 p-4 max-w-xs mx-auto"
            key={index}
          >
            <img className="bg-blue-50 rounded-lg mb-4 w-full h-32 object-cover" src={item.image} alt={item.name} />
            <div className="text-center">
              <div
                className={`flex justify-center items-center gap-2 text-sm ${
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
              <p className="text-gray-900 text-lg font-medium truncate">{item.name}</p>
              <p className="text-gray-600 text-sm truncate">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-blue-50 text-gray-600 px-8 py-2 rounded-full mt-4"
      >
        More
      </button>
    </div>
  );
};

export default TopDoctors;


