import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import earning_icon from '../../assets/earning_icon.svg';
import appoinments_icon from '../../assets/appointments_icon.svg';
import patients_icon from '../../assets/patients_icon.svg';
import list_icon from '../../assets/list_icon.svg';
import cancel_icon from '../../assets/cancel_icon.svg';
import tick_icon from '../../assets/tick_icon.svg';

interface Appointment {
  _id: string;
  slotDate: string;
  cancelled?: boolean;
  isCompleted?: boolean;
  userData: {
    image: string;
    name: string;
  };
}

interface DashDataType {
  appointments: number;
  earnings: number;
  patients: number;
  latestAppointments: Appointment[];
}

interface DoctorContextType {
  dToken: string | null;
  getDashData: () => Promise<void>;
  dashData: DashDataType | boolean; 
  completeAppointment: (appointmentId: string) => void;
  cancelAppointment: (appointmentId: string) => void;
}

const DoctorDashboard: React.FC = () => {
  const doctorContext = useContext(DoctorContext);
  if (!doctorContext) {
    throw new Error("DoctorContext is not available");
  }
  const { dToken, getDashData, dashData, completeAppointment, cancelAppointment } = doctorContext as DoctorContextType;

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken, getDashData]);

  if (typeof dashData !== "object" || dashData === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-gray-500 text-xl">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="container mx-auto">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: earning_icon, value: dashData.earnings, label: "Earnings", color: "bg-blue-50 border-blue-100" },
            { icon: appoinments_icon, value: dashData.appointments, label: "Appointments", color: "bg-green-50 border-green-100" },
            { icon: patients_icon, value: dashData.patients, label: "Patients", color: "bg-purple-50 border-purple-100" }
          ].map((card, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-4 p-6 rounded-xl shadow-md ${card.color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="bg-white p-3 rounded-full shadow-md">
                <img className="w-10 h-10" src={card.icon} alt={`${card.label} Icon`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-gray-500 text-sm">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Appointments Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-gray-100 border-b">
            <img src={list_icon} alt="List Icon" className="w-6 h-6" />
            <h2 className="text-lg font-semibold text-gray-700">Latest Appointments</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {dashData.latestAppointments.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-shrink-0 mr-4">
                  <img 
                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-200" 
                    src={item.userData.image} 
                    alt="User" 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-md font-medium text-gray-900">{item.userData.name}</p>
                  <p className="text-sm text-gray-500">{item.slotDate}</p>
                </div>
                <div className="ml-4">
                  {item.cancelled ? (
                    <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-xs font-medium">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => cancelAppointment(item._id)}
                        className="bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Cancel Appointment"
                      >
                        <img src={cancel_icon} alt="Cancel" className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => completeAppointment(item._id)}
                        className="bg-green-50 text-green-500 p-2 rounded-full hover:bg-green-100 transition-colors"
                        title="Complete Appointment"
                      >
                        <img src={tick_icon} alt="Complete" className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;