import { useLocation, Link } from "react-router-dom"
import { XCircle } from "lucide-react"

const PaymentFailure = () => {
  const location = useLocation()
  const errorMessage = location.state?.errorMessage || "Payment failed. Please try again."

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Payment Failed</h1>

          <div className="w-full my-6 border-t border-gray-200" />

          <div className="w-full p-4 mb-4 bg-red-50 rounded-md border border-red-100">
            <p className="text-red-700">{errorMessage}</p>
          </div>

          <Link
            to="/my-appointments"
            className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Appointments
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailure

