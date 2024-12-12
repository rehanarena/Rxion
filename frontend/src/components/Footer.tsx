import logo from '../assets/Rxion_logo.png';

const Footer = () => {
  return (
    <div className="bg-gray-900 text-white py-16 mt-40">
      <div className="container mx-auto px-6">
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-14">
          {/* Left section */}
          <div className="flex flex-col items-start">
            <img className="mb-6 w-36" src={logo} alt="Company logo" />
            <p className="text-gray-400 text-lg leading-8">
              Your health, our priority. Book doctor appointments easily and manage your medical care from the comfort of your home. For assistance, please contact our support team.
            </p>
          </div>

          {/* Center section */}
          <div className="flex flex-col items-start">
            <p className="text-lg font-medium text-indigo-400 mb-6">COMPANY</p>
            <ul className="space-y-4 text-gray-400">
              <li className="hover:text-indigo-400 cursor-pointer">Home</li>
              <li className="hover:text-indigo-400 cursor-pointer">About Us</li>
              <li className="hover:text-indigo-400 cursor-pointer">Contact Us</li>
              <li className="hover:text-indigo-400 cursor-pointer">Privacy and Policy</li>
            </ul>
          </div>

          {/* Right section */}
          <div className="flex flex-col items-start">
            <p className="text-lg font-medium text-indigo-400 mb-6">GET IN TOUCH</p>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">📞</span> +91 7306127672
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">📧</span> Rxion@gmail.com
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Text */}
        <div className="mt-12 text-center">
          <hr className="border-gray-700 mb-6" />
          <p className="text-gray-500 text-sm py-6">© 2024 All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
