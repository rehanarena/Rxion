import { specialityData } from "../assets/assets"
import { Link } from "react-router-dom"

const SpecialityMenu = () => {
  return (
    <section className="py-16" id="speciality">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Find by Speciality</h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Discover the right specialist for your needs. Expert care tailored to you.
        </p>
      </div>
      <div className="mt-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {specialityData.map((item, index) => (
            <Link
              onClick={() => scrollTo(0, 0)}
              className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              key={index}
              to={`/doctors/${item.speciality}`}
            >
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 group-hover:opacity-75">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.speciality}
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <div className="px-4 py-3">
                <h3 className="text-sm font-medium text-gray-900">{item.speciality}</h3>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-semibold">Explore {item.speciality}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpecialityMenu

