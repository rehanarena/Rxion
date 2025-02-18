import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import type React from "react"

interface Doctor {
  _id: string
  image: string
  name: string
  speciality: string
  available: boolean
}

const TopDoctors: React.FC = () => {
  const navigate = useNavigate()
  const { doctors } = useAppContext()

  return (
    <section className="py-20 bg-gray-50">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">Top Doctors to Book</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 sm:mt-5">
          Connect with our highly-rated and experienced doctors for exceptional care.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-6">
        {doctors.slice(0, 8).map((item: Doctor) => (
          <div
            key={item._id}
            onClick={() => {
              navigate(`/appointment/${item._id}`)
              scrollTo(0, 0)
            }}
            className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-3"
          >
            <div className="relative">
              <img className="w-full h-56 object-cover" src={item.image || "/placeholder.svg"} alt={item.name} />
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    item.available ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                  }`}
                >
                  {item.available ? "Available" : "Not available"}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{item.speciality}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-yellow-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm text-gray-600">4.8</span>
                </div>
                <button className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-all">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-16">
        <button
          onClick={() => {
            navigate("/doctors")
            scrollTo(0, 0)
          }}
          className="px-6 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-all"
        >
          View All Doctors
        </button>
      </div>
    </section>
  )
}

export default TopDoctors
