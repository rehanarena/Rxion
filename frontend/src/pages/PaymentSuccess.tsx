import { useLocation, Link } from "react-router-dom"
import { CheckCircle } from "lucide-react"

const PaymentSuccess = () => {
  const location = useLocation()
  const appointmentId = location.state?.appointmentId

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>

          <div className="w-full my-6 border-t border-gray-200" />

          <p className="text-gray-600 mb-4">Your appointment booking has been confirmed.</p>

          {appointmentId && (
            <div className="w-full p-3 mb-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Appointment ID</p>
              <p className="font-medium">{appointmentId}</p>
            </div>
          )}

          <Link
            to="/my-appointments"
            className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            View My Appointments
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess

