import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import verified_icon from "../assets/verified_icon.svg";
import info_icon from "../assets/info_icon.svg";
import { toast } from "react-toastify";
import axios from "axios";
// import RelatedDoctors from "../components/RelatedDoctors";

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

interface Slot {
  dateTime: Date;
  time: string;
}

const Appointment: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext)!;
  const dayOfWeek = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState<Doctor | null>(null);
  const [docSlots, setDocSlots] = useState<Slot[][]>([]);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const [slotTime, setSlotTime] = useState<string>("");

  const fetchDocInfo = () => {
    const doc = doctors.find((doctor: Doctor) => doctor._id === docId);
    setDocInfo(doc || null);
  };

  // console.log(doctors)

  const getAvailableSlots = () => {
    const today = new Date();
    const slots: Slot[][] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        currentDate.setHours(Math.max(currentDate.getHours() + 1, 10));
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      const daySlots: Slot[] = [];
      while (currentDate < endTime) {
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const slotDate = `${day}_${month}_${year}`;
        const slotTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const isSlotAvailable =
          docInfo?.slots_booked?.[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          daySlots.push({
            dateTime: new Date(currentDate),
            time: currentDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      if (daySlots.length > 0) {
        slots.push(daySlots);
      }
    }

    setDocSlots(slots);
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }
    try {
      const date = docSlots[slotIndex][0].dateTime;
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const slotDate = `${day}_${month}_${year}`;

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

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);
  console.log(docInfo);

  return docInfo ? (
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-primary w-full sm:max-w-72 rounded-lg"
            src={docInfo.image}
            alt={docInfo.name}
          />
        </div>
        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={verified_icon} alt="Verified" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo.experience}
            </button>
          </div>

          <div className="text-sm font-medium text-gray-900 mt-3">
            <div className="flex items-center gap-1">
              <p>About</p>
              <img className="w-4 h-4" src={info_icon} alt="Info" />
            </div>
            <p className="text-sm text-gray-500 max-w-[700px] mt-2">
              {docInfo.about}
            </p>
          </div>

          <p className="text-gray-500 font-medium mt-4">
            Appointment Fee:{" "}
            <span className="text-gray-600">
              {currencySymbol}
              {docInfo.fees}
            </span>
          </p>
          <p className="text-gray-500 font-medium mt-4">
            Appointment Location:{" "}
            <span className="text-gray-600">
              {docInfo.address
                ? `${docInfo.address.line1}, ${docInfo.address.line2}`
                : "Location not available"}
            </span>
          </p>
        </div>
      </div>

      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking Slots</p>
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
          {docSlots.map((daySlots, index) => (
            <div
              key={index}
              onClick={() => setSlotIndex(index)}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                slotIndex === index
                  ? "bg-primary text-white"
                  : "border border-gray-200"
              }`}
            >
              <p>
                {daySlots[0] ? dayOfWeek[daySlots[0].dateTime.getDay()] : ""}
              </p>
              <p>{daySlots[0] ? daySlots[0].dateTime.getDate() : ""}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
          {docSlots[slotIndex]?.map((slot, index) => (
            <p
              key={index}
              onClick={() => setSlotTime(slot.time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                slot.time === slotTime
                  ? "bg-primary text-white"
                  : "text-gray-400 border border-gray-300"
              }`}
            >
              {slot.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button
          onClick={bookAppointment}
          className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
        >
          Book an Appointment
        </button>
      </div>
      {/* <RelatedDoctors docId={docId} speciality={docInfo.speciality || 'Unknown'} /> */}
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Appointment;
