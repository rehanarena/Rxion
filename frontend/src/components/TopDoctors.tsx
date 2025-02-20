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
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">{item.speciality}</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{item.name}</h3>
              <div className="flex justify-center items-center">
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
