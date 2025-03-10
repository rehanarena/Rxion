import React, { useContext } from "react"
import { AdminContext } from "../context/AdminContext"
import { NavLink } from "react-router-dom"
import home_icon from '../assets/home_icon.svg';
import appoinment_icon from '../assets/appointment_icon.svg';
import add_icon from '../assets/add_icon.svg'
import people_icon from '../assets/people_icon.svg'
import time_icon from '../assets/time_icon.svg'
import { DoctorContext } from "../context/DoctorContext";

interface AdminContextType{
  aToken: string| null
}
interface DoctorContextType{
  dToken: string| null
}

const Sidebar: React.FC = () => {

  const {aToken} = useContext(AdminContext)as AdminContextType
  const {dToken} = useContext(DoctorContext)as DoctorContextType

  return (
    <div className="min-h-screen bg-white border-r">
      {
        aToken && <ul className="text-[#515151] mt-5">
          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/admin-dashboard'}>
            <img src={home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/user-list'}>
            <img src={people_icon} alt="" />
            <p className="hidden md:block">UserList</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/all-appoinments'}>
            <img src={appoinment_icon} alt="" />
            <p className="hidden md:block">Appoinments</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/add-doctor'}>
            <img src={add_icon} alt="" />
            <p className="hidden md:block">Add Doctor</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-list'}>
            <img src={people_icon} alt="" />
            <p className="hidden md:block">Doctor List</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/all-doctors'}>
            <img src={people_icon} alt="" />
            <p className="hidden md:block">AllDoctors</p>
          </NavLink>

        </ul>
      }

{
        dToken && <ul className="text-[#515151] mt-5">
          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-dashboard'}>
            <img src={home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>


          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-appoinments'}>
            <img src={appoinment_icon} alt="" />
            <p className="hidden md:block">Appoinments</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-profile'}>
            <img src={people_icon} alt="" />
            <p className="hidden md:block">Profile</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-slots'}>
            <img src={add_icon} alt="" />
            <p className="hidden md:block">Add Slots</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-slot-manage'}>
            <img src={time_icon} alt="" />
            <p className="hidden md:block">SlotManagement</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/'}>
            <img src={time_icon} alt="" />
            <p className="hidden md:block">message</p>
          </NavLink>
        </ul>
      }
    </div>
  )
}

export default Sidebar
