import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Rxion_logo.png";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error("AppContext must be used within an AppContextProvider");
  }

  const { token, setToken } = appContext;
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white shadow-sm">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        className="h-14 w-auto cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* Navigation Links */}
      <ul className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
        {["HOME", "ALL DOCTORS", "ABOUT", "CONTACT"].map((item, index) => (
          <NavLink
          key={index}
          to={
            item === "HOME"
              ? "/"
              : item === "ALL DOCTORS"
              ? "/doctors"
              : item === "ABOUT"
              ? "/about"
              : item === "CONTACT"
              ? "/contact"
              : `/${item.toLowerCase().replace(" ", "-")}`
          }
          className="relative group text-lg transition hover:text-blue-600"
        >
          {item}
          <span className="absolute left-1/2 -bottom-1 w-3/5 h-0.5 bg-blue-500 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
        </NavLink>
        
        
        ))}
      </ul>

      {/* Profile or Login Button */}
      <div className="flex items-center gap-4">
        {token ? (
          <div
            className="relative flex items-center gap-2 cursor-pointer group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img className="w-10 h-10 rounded-full border-2 border-gray-300" src={assets.profile_pic} alt="Profile" />
            <img className="w-3" src={assets.dropdown_icon} alt="Dropdown" />

            {showDropdown && (
              <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg flex flex-col gap-2 py-2 px-4 z-20 min-w-[160px]">
                <p onClick={() => navigate("/my-profile")} className="text-gray-600 hover:text-black cursor-pointer transition">
                  My Profile
                </p>
                <p onClick={() => navigate("/my-appointments")} className="text-gray-600 hover:text-black cursor-pointer transition">
                  My Appointments
                </p>
                <p onClick={() => navigate("/my-wallet")} className="text-gray-600 hover:text-black cursor-pointer transition">
                  My wallet
                </p>
                <p onClick={logout} className="text-red-500 hover:text-red-700 cursor-pointer transition">
                  Logout
                </p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm py-2 px-6 border border-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition"
          >
            Create Account
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img onClick={() => setShowMenu(true)} className="w-6 md:hidden cursor-pointer" src={assets.menu_icon} alt="Menu Icon" />
      </div>

      {/* -----Mobile Menu ----- */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${
          showMenu ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 md:hidden`}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-gray-200">
          <img className="w-32" src={logo} alt="Logo" />
          <img className="w-7 cursor-pointer" onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="Close Menu" />
        </div>
        <ul className="flex flex-col items-center gap-4 mt-6 text-lg font-medium">
          {["HOME", "ALL DOCTORS", "ABOUT", "CONTACT"].map((item, index) => (
            <NavLink key={index} onClick={() => setShowMenu(false)} to={item === "HOME" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}>
              <p className="px-4 py-2 rounded-md transition hover:bg-blue-500 hover:text-white">{item}</p>
            </NavLink>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
