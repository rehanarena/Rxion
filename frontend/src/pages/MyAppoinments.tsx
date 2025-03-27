import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, CreditCard, X } from "lucide-react";
import io from "socket.io-client";

interface IncomingCallData {
  callerId: string;
  room: string;
  callType?: string;
}

interface DoctorData {
  image: string;
  name: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  address: {
    line1: string;
    line2: string;
  };
  date: number;
  time: string;
}

interface Appointment {
  _id: string;
  doctData: DoctorData;
  slotDate: string;
  slotTime: string;
  cancelled: boolean;
  payment: boolean;
  isCompleted?: boolean;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
export interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

interface AppContextType {
  backendUrl: string;
  token: string | false;
  getDoctorsData: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Order {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

const backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"? import.meta.env.VITE_PRODUCTION_URL_BACKEND: import.meta.env.VITE_BACKEND_URL
const socket = io(backendUrl);

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate: string): string => {
    const dateObj = new Date(slotDate);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getUsersAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message || "An error occurred while fetching appointments");
      } else {
        console.error("An unexpected error occurred:", error);
        toast.error("An unexpected error occurred while fetching appointments");
      }
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        getUsersAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message || "An error occurred while cancelling appointment");
      } else {
        console.error("An unexpected error occurred:", error);
        toast.error("An unexpected error occurred while cancelling appointment");
      }
    }
  };

  const initPay = (order: Order, appointmentId: string): void => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Rxion Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-razorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            navigate("/payment-success", { state: { appointmentId } });
          } else {
            navigate("/payment-failure", { state: { errorMessage: data.message } });
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            navigate("/payment-failure", { state: { errorMessage: error.message || "Payment verification failed." } });
          } else {
            navigate("/payment-failure", { state: { errorMessage: "Payment verification failed." } });
          }
        }
      },
      modal: {
        ondismiss: () => {
          setTimeout(() => {
            navigate("/payment-failure", { state: { errorMessage: "Payment cancelled by user." } });
          }, 300);
        }
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response: RazorpayErrorResponse) {
      rzp.close();
      setTimeout(() => {
        navigate("/payment-failure", { state: { errorMessage: response.error.description || "Payment failed." } });
      }, 900);
    });

    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId: string) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } },
      );
      if (data.success) {
        if (data.order) {
          initPay(data.order, appointmentId);
        } else {
          navigate("/payment-success", { state: { appointmentId } });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message || "An error occurred during payment");
      } else {
        console.error("An unexpected error occurred", error);
        toast.error("An unexpected error occurred during payment");
      }
    }
  };

  useEffect(() => {
    socket.on("call-made", (data: IncomingCallData) => {
      console.log("Incoming call received:", data);
      setIncomingCall(data);
    });

    return () => {
      socket.off("call-made");
    };
  }, []);

  useEffect(() => {
    appointments.forEach((appointment) => {
      socket.emit("join-room", appointment._id);
    });
  }, [appointments]);

  const acceptCall = () => {
    if (incomingCall) {
      navigate(`/patient/video-call/${incomingCall.room}`);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("reject-call", { room: incomingCall.room });
      setIncomingCall(null);
    }
  };

  useEffect(() => {
    if (token) {
      getUsersAppointments();
    }
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4 text-xl">Incoming call from Doctor</p>
            <div className="flex gap-4">
              <button onClick={acceptCall} className="py-2 px-4 bg-green-500 text-white rounded">
                Accept
              </button>
              <button onClick={rejectCall} className="py-2 px-4 bg-red-500 text-white rounded">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appointment, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
            <div className="p-4 flex-grow">
              <div className="flex items-center space-x-3 mb-2">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={appointment.doctData.image || "/placeholder.svg"}
                  alt={appointment.doctData.name}
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {appointment.doctData.name}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {appointment.doctData.speciality}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {slotDateFormat(appointment.slotDate)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {new Date(appointment.slotTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {appointment.doctData.address.line1}, {appointment.doctData.address.line2}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 mt-auto">
              {appointment.cancelled ? (
                <div className="flex items-center text-red-600 text-sm">
                  <X className="w-4 h-4 mr-2" />
                  <span>Appointment Cancelled</span>
                </div>
              ) : appointment.isCompleted ? (
                <div className="flex items-center text-green-600 text-sm">
                  <span>Completed</span>
                </div>
              ) : appointment.payment ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Paid</span>
                </div>
              ) : (
                <button
                  onClick={() => appointmentRazorpay(appointment._id)}
                  className="w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600 transition duration-300"
                >
                  Pay Online
                </button>
              )}
              {!appointment.cancelled && !appointment.isCompleted && (
                <button
                  onClick={() => cancelAppointment(appointment._id)}
                  className="w-full mt-2 bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600 transition duration-300"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
