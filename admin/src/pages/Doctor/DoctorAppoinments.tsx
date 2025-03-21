import { useContext, useEffect } from "react"
import { DoctorContext } from "../../context/DoctorContext"
import { AppContext } from "../../context/AppContext"
import { Check, Video, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface userData {
  name: string
  image: string
  dob: string
  medicalHistory?: string 
}
interface Appointment {
  _id: string
  userData: userData
  amount: number
  slotDate: string
  slotTime: string
  cancelled: boolean
  payment: boolean
  isCompleted: boolean
}

interface DoctorContextType {
  dToken: string | null
  appointments: Appointment[]
  getAppointments: () => void
  completeAppointment: (id: string) => void
  cancelAppointment: (id: string) => void
}

interface AppContextType {
  currencySymbol: string
  slotDateFormat: (date: string, time: string) => string
  calculateAge: (dob: string) => number
}

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(
    DoctorContext,
  ) as DoctorContextType
  const { calculateAge, slotDateFormat, currencySymbol } = useContext(AppContext) as AppContextType
  const navigate = useNavigate()

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken, getAppointments])

  const handleVideoChat = (appointment: Appointment) => {
    navigate(`/doctor/video-call/${appointment._id}`);
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Appointments</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-[80vh] overflow-y-auto pr-2">
        {appointments.reverse().map((appointment) => (
          <div
            key={appointment._id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg"
          >
            {/* Status Banner */}
            {appointment.cancelled ? (
              <div className="bg-red-500 text-white text-center py-1 text-sm font-medium">Cancelled</div>
            ) : appointment.isCompleted ? (
              <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">Completed</div>
            ) : (
              <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">Upcoming</div>
            )}

            {/* Patient Info */}
            <div className="p-4 flex items-center gap-3 border-b border-gray-100">
              <img
                src={appointment.userData.image || "/placeholder.svg"}
                alt={appointment.userData.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{appointment.userData.name}</h3>
                <p className="text-sm text-gray-500">Age: {calculateAge(appointment.userData.dob)}</p>
                {appointment.userData.medicalHistory && (
                  <p className="text-sm text-gray-600">
                    <strong>Medical History:</strong> {appointment.userData.medicalHistory}
                  </p>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date & Time</span>
                <span className="text-sm font-medium text-gray-800">
                  {slotDateFormat(appointment.slotDate, appointment.slotTime)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Payment</span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    appointment.payment ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {appointment.payment ? "Paid" : "Pending"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fees</span>
                <span className="text-sm font-medium text-gray-800">
                  {currencySymbol} {appointment.amount}
                </span>
              </div>
            </div>

            {/* Actions */}
            {!appointment.cancelled && !appointment.isCompleted && (
              <div className="p-4 pt-0 flex justify-between gap-2">
                <button
                  onClick={() => cancelAppointment(appointment._id)}
                  className="flex-1 py-2 rounded-md bg-red-50 text-red-600 font-medium text-sm flex items-center justify-center gap-1 transition-colors hover:bg-red-100"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>

                <button
                  onClick={() => completeAppointment(appointment._id)}
                  className="flex-1 py-2 rounded-md bg-green-50 text-green-600 font-medium text-sm flex items-center justify-center gap-1 transition-colors hover:bg-green-100"
                >
                  <Check size={16} />
                  <span>Complete</span>
                </button>

                <button
                  onClick={() => handleVideoChat(appointment)}
                  className="flex-1 py-2 rounded-md bg-blue-50 text-blue-600 font-medium text-sm flex items-center justify-center gap-1 transition-colors hover:bg-blue-100"
                >
                  <Video size={16} />
                  <span>Call</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments
