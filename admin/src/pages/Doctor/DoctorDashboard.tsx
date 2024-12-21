import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import earning_icon from '../../assets/earning_icon.svg'
import appoinments_icon from '../../assets/appointments_icon.svg'
import patients_icon from '../../assets/patients_icon.svg'

interface DashDataType {
  appointments: number;
  earnings: number;
  patients: number;
}

interface DoctorContextType {
  dToken: string | null;
  getDashData: () => Promise<void>;
  dashData: DashDataType | null;
}
  const DoctorDashboard: React.FC = () => {
    const { dToken, getDashData, dashData } = useContext(DoctorContext) as DoctorContextType;

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken, getDashData]);

  if (!dashData) {
    return <p className="text-gray-500">Loading dashboard data...</p>;
  }

  return dashData &&(
    <div className="m-5">
       <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={earning_icon} alt="Doctor Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.earnings}</p>
            <p className="text-gray-400">Doctors</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={appoinments_icon} alt="Patients Icon" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
            <p className="text-gray-400">Appoinments</p>
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
  )
};

export default DoctorDashboard;
