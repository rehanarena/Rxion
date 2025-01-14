import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
  date: number; // Unix timestamp (in milliseconds)
  time: string;
}

interface Appointment {
  _id: string
  doctData: DoctorData;
  slotDate: string;
  slotTime: string; 
  cancelled: boolean;
  payment: boolean;
}

// Define the context structure
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

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
const MyAppointments = () => {
  const { backendUrl, token,getDoctorsData } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate: string): string => {
    const dateArray = slotDate.split('_');
    if (dateArray.length === 3) {
      const day = dateArray[0];
      const month = months[Number(dateArray[1]) - 1]; // Correct month indexing
      const year = dateArray[2];
      return `${day} ${month} ${year}`;
    }
    return "Invalid date"; // Fallback in case of invalid date format
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
        toast.error(error.message || 'An error occurred while fetching appointments');
      } else {
        console.error('An unexpected error occurred:', error);
        toast.error('An unexpected error occurred while fetching appointments');
      }
    }
  };
  const cancelAppointment = async(appointmentId: string) =>{
    try {
      
      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment',{appointmentId},{headers:{token}})
      if (data.success) {
        toast.success(data.message)
        getUsersAppointments()
        getDoctorsData()
      }else{
        toast.error(data.message)
      }


    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message || 'An error occurred while fetching appointments');
      } else {
        console.error('An unexpected error occurred:', error);
        toast.error('An unexpected error occurred while fetching appointments');
      }
    }
  }

  const initPay = (order: Order): void =>{
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Rxion Payment',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async(response: string)=>{
        console.log(response)

        try {
          const {data} = await axios.post(backendUrl+ '/api/user/verify-razorpay',response,{headers:{token}})
          if(data.success){
            getUsersAppointments()
            navigate('/my-appointments')
            
          }
        }  catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error);
            toast.error(error.message || 'An error occurred while payment');
          } else {
            console.error('An unexpected error occurred:', error);
            toast.error('An unexpected error occurred while payment');
          }
        }
      }

    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }


  const appointmentRazorpay = async(appointmentId:string) =>{
    try {
      const {data} = await axios.post(backendUrl+ '/api/user/payment-razorpay',{appointmentId},{headers:{token}})
      if (data.success) {
        initPay(data.order)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message || 'An error occurred while payment');
      } else {
        console.error('An unexpected error occurred:', error);
        toast.error('An unexpected error occurred while payment');
      }
    }
  }

  useEffect(() => {
    if (token) {
      getUsersAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My appointments</p>
      <div>
        {appointments.map((appointment, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={appointment.doctData.image}
                alt="Doctor"
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{appointment.doctData.name}</p>
              <p>{appointment.doctData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{appointment.doctData.address.line1 || "Address not available"}</p>
              <p className="text-xs">{appointment.doctData.address.line2 || ""}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">Date & Time:</span>{' '}
                {slotDateFormat(appointment.slotDate)} | {appointment.slotTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              {!appointment.cancelled && appointment.payment && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button>}
              {!appointment.cancelled && !appointment.payment && <button onClick={()=>appointmentRazorpay(appointment._id)}
                className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300"
              >
                Pay Online
              </button>}
              
              {!appointment.cancelled && <button
              onClick={()=>cancelAppointment(appointment._id)}
                className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                Cancel Appointment
              </button>}
              {appointment.cancelled && <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 text-sm">Appointment Cancelled</button>}
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
