import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import doctor_icon from '../../assets/doctor_icon.svg';
import patients_icon from '../../assets/patients_icon.svg';


interface DashDataType {
  appointments: number;
  doctors: number;
  patients: number;
}

interface AdminContextType {
  aToken: string | null; 
  getDashData: () => Promise<void>; 
  dashData: DashDataType | null;
}

const Dashboard: React.FC = () => {
  const { aToken, getDashData, dashData } = useContext(AdminContext) as AdminContextType;

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken, getDashData]);

  if (!dashData) {
    return <p className="text-gray-500">Loading dashboard data...</p>;
  }

  return (
    <div className="m-5">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={doctor_icon} alt="Doctor Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.doctors}</p>
            <p className="text-gray-400">Doctors</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={patients_icon} alt="Patients Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>

      </div>

    </div>

  );
};

export default Dashboard;
