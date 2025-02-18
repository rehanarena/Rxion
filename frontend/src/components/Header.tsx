import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center">
        <div className="relative z-10 w-full px-6 py-12 sm:py-16 lg:w-1/2">
          <main className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Book Appointments with</span>{" "}
              <span className="block text-indigo-600">Trusted Doctors</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 sm:mt-6 sm:text-xl">
              Rxion connects you with top specialists. Your health journey starts here.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
              <a
                href="#speciality"
                className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 transition"
              >
                Book Appointments
              </a>
              <a
                href="/about"
                className="px-8 py-3 text-lg font-medium text-indigo-700 bg-indigo-100 rounded-md shadow-md hover:bg-indigo-200 transition"
              >
                Learn More
              </a>
            </div>
          </main>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            className="w-full h-64 object-cover sm:h-80 md:h-96 lg:h-full rounded-lg shadow-lg"
            src={assets.header_img || "/placeholder.svg"}
            alt="Doctor consultation"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
