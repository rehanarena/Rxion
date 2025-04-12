import React, { useContext } from "react"
import { AdminContext } from "../context/AdminContext"
import { NavLink } from "react-router-dom"
import { 
  Home, 
  Users, 
  Calendar, 
  PlusCircle, 
  BookOpen, 
  Stethoscope, 
  FileText, 
  UserPlus, 
  MessageCircle,
} from 'lucide-react';
import { DoctorContext } from "../context/DoctorContext";
import { AdminContextType } from "../Interfaces/AdminContext";
import { DoctorContextType } from "../Interfaces/Doctor";
const Sidebar: React.FC = () => {

  const {aToken} = useContext(AdminContext)as AdminContextType
  const {dToken} = useContext(DoctorContext)as DoctorContextType

  const iconProps = {
    size: 24,
    className: "text-gray-600"
  };

  return (
    <div className="min-h-screen bg-white border-r">
      {
        aToken && <ul className="text-[#515151] mt-5">
          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/admin-dashboard'}>
            <Home {...iconProps} />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/user-list'}>
            <Users {...iconProps} />
            <p className="hidden md:block">UserList</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/all-appoinments'}>
            <Calendar {...iconProps} />
            <p className="hidden md:block">Appoinments</p>
          </NavLink>
          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/speciality'}>
            <BookOpen {...iconProps} />
            <p className="hidden md:block">Speciality</p>
          </NavLink>
          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/add-doctor'}>
            <UserPlus {...iconProps} />
            <p className="hidden md:block">Add Doctor</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-list'}>
            <Stethoscope {...iconProps} />
            <p className="hidden md:block">Doctor List</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/reports'}>
            <FileText {...iconProps} />
            <p className="hidden md:block">Reports</p>
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
            <Home {...iconProps} />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>


          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-appoinments'}>
            <Calendar {...iconProps} />
            <p className="hidden md:block">Appoinments</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-profile'}>
            <Users {...iconProps} />
            <p className="hidden md:block">Profile</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-slot-manage'}>
            <PlusCircle {...iconProps} />
            <p className="hidden md:block">SlotManagement</p>
          </NavLink>

          <NavLink  className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            } to={'/doctor-patient-list'}>
            <MessageCircle {...iconProps} />
            <p className="hidden md:block">message</p>
          </NavLink>
        </ul>
      }
    </div>
  )
}

export default Sidebar