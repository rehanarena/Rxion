import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import verified_icon from "../assets/verified_icon.svg";
import info_icon from "../assets/info_icon.svg";
import { toast } from "react-toastify";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";

interface Address {
  line1: string;
  line2: string;
}

interface Doctor {
  _id: string;
  image: string;
  name: string;
  address?: Address;
  speciality: string;
  available: boolean;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  slots_booked?: { [date: string]: string[] };
}

const Appointment: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext)!;
  const { docSlots, fetchSlots } = useContext(DoctorContext)!;
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState<Doctor | null>(null);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const [slotTime, setSlotTime] = useState<string>("");

  useEffect(() => {
    if (docId) {
      fetchDocInfo();
      fetchSlots(docId);
    }
  }, [docId, fetchSlots]);

  const fetchDocInfo = () => {
    const doc = doctors.find((doctor: Doctor) => doctor._id === docId);
    setDocInfo(doc || null);
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    try {
      const selectedSlot = docSlots.find((slot) => {
        const slotStartTime = new Date(slot.startTime);
        const slotEndTime = new Date(slot.endTime);
        const selectedTime = new Date(slotTime);

        return selectedTime >= slotStartTime && selectedTime <= slotEndTime;
      });

      if (!selectedSlot) {
        toast.warn("Please select a valid slot.");
        return;
      }

      const date = new Date(selectedSlot.startTime);
      const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const generateHalfHourSlots = (startTime: string, endTime: string) => {
    const slots = [];
    const start = new Date(startTime);
    const end = new Date(endTime);

    while (start < end) {
      slots.push(new Date(start));
      start.setMinutes(start.getMinutes() + 30); 
    }

    return slots;
  };

  const getBookedSlots = () => {
    const bookedSlots: string[] = [];
    if (docInfo?.slots_booked) {
      Object.values(docInfo.slots_booked).forEach((bookedDates) => {
        bookedSlots.push(...bookedDates);
      });
    }
    // console.log("Booked Slots:", bookedSlots); 
    return bookedSlots;
  };
  
  // console.log("Doctor Info:", docInfo);
  // console.log("Slots Booked:", docInfo?.slots_booked);
  
  return docInfo ? (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/3 flex justify-center sm:justify-start">
          <img
            className="w-full sm:max-w-xs rounded-lg shadow-md"
            src={docInfo.image}
            alt={docInfo.name}
          />
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <p className="text-2xl font-semibold text-gray-800">
              {docInfo.name}
            </p>
            <img className="w-6" src={verified_icon} alt="Verified" />
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className="py-1 px-3 bg-gray-200 text-xs rounded-full">
              {docInfo.experience}
            </button>
          </div>
          <div className="text-sm mt-4">
            <div className="flex items-center gap-2">
              <p>About</p>
              <img className="w-5 h-5" src={info_icon} alt="Info" />
            </div>
            <p className="mt-2 text-gray-500">{docInfo.about}</p>
          </div>
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-700">
              Appointment Fee:
            </p>
            <p className="text-xl text-gray-800">
              {currencySymbol}
              {docInfo.fees}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-700">Location:</p>
            <p className="text-sm text-gray-600">
              {docInfo.address
                ? `${docInfo.address.line1}, ${docInfo.address.line2}`
                : "Location not available"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
  <p className="text-xl font-medium text-gray-700">Available Booking Slots</p>
  <div className="mt-4 flex gap-4 overflow-x-auto">
    {(() => {
      // console.log("Slots Booked:", docInfo?.slots_booked);
      // Get available slots and log them to the console
      // const bookedSlots = getBookedSlots();
// console.log("Booked Slots from getBookedSlots():", bookedSlots);
      const availableSlots = docSlots.filter((slot) => {
        const dateObj = new Date(slot.startTime);
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);

        const bookedSlots = getBookedSlots();

        return (
          dateObj >= today &&
          dateObj <= sevenDaysLater &&
          !bookedSlots.includes(new Date(slot.startTime).toISOString())
        );
      });

      // console.log("Available Slots:", availableSlots); 

      return availableSlots.map((slot, index) => {
        const dateObj = new Date(slot.startTime);
        return (
          <div
            key={index}
            onClick={() => setSlotIndex(index)}
            className={`flex flex-col items-center py-3 min-w-24 rounded-lg cursor-pointer ${slotIndex === index
              ? "bg-primary text-white shadow-md"
              : "border border-gray-300"
              }`}
          >
            <p className="text-sm font-semibold text-gray-800">
              {dateObj.toLocaleDateString([], { weekday: "short" })}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {dateObj.toLocaleDateString([], { day: "numeric", month: "short" })}
            </p>
          </div>
        );
      });
    })()}
  </div>
</div>


      <div className="mt-6">
        <div className="flex gap-4 overflow-x-auto">
          {docSlots[slotIndex] &&
            generateHalfHourSlots(
              docSlots[slotIndex].startTime,
              docSlots[slotIndex].endTime
            ).map((slot, idx) => (
              <p
                key={idx}
                onClick={() => setSlotTime(slot.toISOString())}
                className={`text-sm cursor-pointer py-2 px-4 rounded-full border border-gray-300 ${slotTime === slot.toISOString()
                  ? "bg-primary text-white"
                  : "text-gray-800"
                  }`}
              >
                {slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={bookAppointment}
          className="w-full py-3 bg-primary text-white rounded-lg shadow-md"
        >
          Book Appointment
        </button>
      </div>
    </div>
  ) : null;
};

export default Appointment;
