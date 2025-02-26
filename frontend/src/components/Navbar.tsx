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

  const { token, setToken, userData } = appContext;
  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between py-4 mb-5 border-b border-gray-300">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        className="h-16 w-auto cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* Navigation Links */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        <NavLink to="/" className="text-gray-700 hover:text-blue-500 transition">
          <li className="py-1 group">
            HOME
            <hr className="h-0.5 bg-primary w-3/5 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </li>
        </NavLink>
        <NavLink
          to="/doctors"
          className="text-gray-700 hover:text-blue-500 transition"
        >
          <li className="py-1 group">
            ALL DOCTORS
            <hr className="h-0.5 bg-primary w-3/5 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </li>
        </NavLink>
        <NavLink
          to="/about"
          className="text-gray-700 hover:text-blue-500 transition"
        >
          <li className="py-1 group">
            ABOUT
            <hr className="h-0.5 bg-primary w-3/5 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </li>
        </NavLink>
        <NavLink
          to="/contact"
          className="text-gray-700 hover:text-blue-500 transition"
        >
          <li className="py-1 group">
            CONTACT
            <hr className="h-0.5 bg-primary w-3/5 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </li>
        </NavLink>
      </ul>

      {/* Profile or Create Account Button */}
      <div className="flex items-center gap-4">
        {token ? (
          <div
            className="flex items-center gap-2 cursor-pointer group relative"
            onClick={() => setShowMenu(!showMenu)}
          >
            <img
              className="w-10 h-10 rounded-full"
              src={
                userData?.image
                  ? `${userData.image}?t=${new Date().getTime()}`
                  : assets.profile_pic
              }
              alt="Profile"
            />
            <img className="w-3" src={assets.dropdown_icon} alt="Dropdown" />
            {showMenu && (
              <div className="absolute top-14 right-0 bg-white shadow-lg rounded-lg flex flex-col gap-2 py-2 px-4 z-20 min-w-[150px]">
                <p
                  onClick={() => navigate("/my-profile")}
                  className="text-gray-600 hover:text-black cursor-pointer transition whitespace-nowrap"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/my-appointments")}
                  className="text-gray-600 hover:text-black cursor-pointer transition whitespace-nowrap"
                >
                  My Appointments
                </p>
                <p
                  onClick={logout}
                  className="text-gray-600 hover:text-black cursor-pointer transition whitespace-nowrap"
                >
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
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu Icon"
        />
        {/* ----- Mobile Menu ----- */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-0 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={logo} alt="Logo" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt="Close Menu"
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 rounded inline-block">HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 rounded inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 rounded inline-block">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
