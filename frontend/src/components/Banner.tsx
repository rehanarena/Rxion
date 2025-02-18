import { useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"

const Banner = () => {
  const navigate = useNavigate()

  return (
    <div className="relative bg-indigo-800 my-16">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src={assets.appointment_img || "/placeholder.svg"}
          alt="Doctor appointment"
        />
        <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" aria-hidden="true"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Book Appointments with 100+ Trusted Doctors
        </h2>
        <p className="mt-6 max-w-3xl text-xl text-indigo-100">
          Join Rxion today and take control of your health journey with our network of expert doctors. Experience
          healthcare reimagined.
        </p>
        <div className="mt-10 max-w-sm sm:flex sm:max-w-none">
          <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
            <button
              onClick={() => {
                navigate("/login")
                scrollTo(0, 0)
              }}
              className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8"
            >
              Create Account
            </button>
            <button
              onClick={() => {
                navigate("/about")
                scrollTo(0, 0)
              }}
              className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner

