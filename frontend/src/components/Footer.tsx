import logo from '../assets/Rxion_logo.png';

const Footer = () => {
  return (
    <footer className="bg-indigo-600 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <img src={logo} alt="Company logo" className="w-16 mb-4" />
            <p className="text-indigo-100 text-sm">
              Your health, our priority. Book appointments easily and manage your care from home.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li className="hover:text-indigo-300 cursor-pointer text-sm transition-all">Home</li>
              <li className="hover:text-indigo-300 cursor-pointer text-sm transition-all">About Us</li>
              <li className="hover:text-indigo-300 cursor-pointer text-sm transition-all">Contact Us</li>
              <li className="hover:text-indigo-300 cursor-pointer text-sm transition-all">Privacy & Policy</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm transition-all">
                <span className="text-indigo-300">📞</span> +91 7306127672
              </li>
              <li className="flex items-center gap-2 text-sm transition-all">
                <span className="text-indigo-300">📧</span> Rxion@gmail.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-indigo-700 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-indigo-200 text-xs">© 2024 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
