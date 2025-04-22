"use client";

import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare, Check } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { DoctorContext } from "../context/DoctorContext";

interface BookedSlot {
  date: string;
  time: string;
}

interface Doctor {
  _id: string;
  image: string;
  name: string;
  speciality: string;
  available: boolean;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  slots_booked?: { [key: string]: BookedSlot[] };
}

const Appointment = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();

  const {
    doctors,
    currencySymbol,
    backendUrl,
    token,
    getDoctorsData,
    userData,
  } = useContext(AppContext)!;
  const { docSlots, fetchSlots } = useContext(DoctorContext)!;

  const [docInfo, setDocInfo] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slotTime, setSlotTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData && "isBlocked" in userData && userData.isBlocked) {
      toast.error("Your account has been blocked by admin.");
      navigate("/login");
    }
  }, [userData, navigate]);

  useEffect(() => {
    const loadDoctorAndSlots = async () => {
      if (!docId || doctors.length === 0) return;

      setIsLoading(true);

      fetchDocInfo();
      try {
        await fetchSlots(docId);
      } catch (err) {
        console.error("Failed to load slots:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctorAndSlots();
  }, [docId, doctors]);

  const fetchDocInfo = () => {
    const doc = doctors.find((doctor: Doctor) => doctor._id === docId);
    setDocInfo(doc || null);
  };

  const addBookedSlotToDocInfo = (newSlot: BookedSlot) => {
    if (!docInfo) return;
    const updatedDocInfo = { ...docInfo };
    if (!updatedDocInfo.slots_booked) {
      updatedDocInfo.slots_booked = {};
    }
    if (!updatedDocInfo.slots_booked[newSlot.date]) {
      updatedDocInfo.slots_booked[newSlot.date] = [];
    }
    updatedDocInfo.slots_booked[newSlot.date].push(newSlot);
    setDocInfo(updatedDocInfo);
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
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

      const slotDate = new Date(selectedSlot.startTime)
        .toISOString()
        .split("T")[0];
      const { data } = await api.post(
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

        const formattedSlotTime = new Date(slotTime).toISOString();
        const slotDatePart = formattedSlotTime.split("T")[0];
        const slotTimePart = new Date(formattedSlotTime).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        );

        const newSlot: BookedSlot = {
          date: slotDatePart,
          time: slotTimePart,
        };

        addBookedSlotToDocInfo(newSlot);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateHalfHourSlots = (startTime: string, endTime: string) => {
    const slots: Date[] = [];
    const start = new Date(startTime);
    const end = new Date(endTime);
    while (start < end) {
      slots.push(new Date(start));
      start.setMinutes(start.getMinutes() + 30);
    }
    return slots;
  };

  const getBookedSlots = (): BookedSlot[] => {
    const booked: BookedSlot[] = [];
    if (docInfo?.slots_booked) {
      Object.values(docInfo.slots_booked).forEach((slotArray) => {
        if (Array.isArray(slotArray)) {
          slotArray.forEach((slot: BookedSlot) => {
            if (slot.date && slot.time) {
              booked.push(slot);
            }
          });
        } else {
          console.warn("Expected an array but got:", slotArray);
        }
      });
    }
    return booked;
  };

  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const bookedSlots = getBookedSlots();
  const bookedSlotSet = new Set(bookedSlots.map((b) => `${b.date} ${b.time}`));

  const availableDocSlots = docSlots.filter((slot) => {
    const slotDateObj = new Date(slot.startTime);
    const slotDate = slotDateObj.toISOString().split("T")[0];
    const slotTimeFormatted = slotDateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const slotDateTime = `${slotDate} ${slotTimeFormatted}`;
    return (
      slotDateObj >= today &&
      slotDateObj <= sevenDaysLater &&
      !bookedSlotSet.has(slotDateTime)
    );
  });

  const groupedSlots = availableDocSlots.reduce((acc, slot) => {
    const slotDateStr = new Date(slot.startTime).toDateString();
    if (!acc[slotDateStr]) {
      acc[slotDateStr] = [];
    }
    acc[slotDateStr].push(slot);
    return acc;
  }, {} as { [key: string]: typeof docSlots });

  const slotsForSelectedDate = selectedDate
    ? groupedSlots[selectedDate.toDateString()] || []
    : [];
  const timeSlotsSet = new Set<string>();
  const timeSlots: Date[] = [];
  const bookedSlotTimes = new Set(
    bookedSlots.map((b) => new Date(`${b.date}T${b.time}`).toISOString())
  );

  slotsForSelectedDate.forEach((slot) => {
    const halfHourSlots = generateHalfHourSlots(slot.startTime, slot.endTime);
    halfHourSlots.forEach((time) => {
      const iso = time.toISOString();
      if (!timeSlotsSet.has(iso) && !bookedSlotTimes.has(iso)) {
        timeSlotsSet.add(iso);
        timeSlots.push(time);
      }
    });
  });

  timeSlots.sort((a, b) => a.getTime() - b.getTime());

  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Book Appointment
        </h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
          <div className="md:flex">
            <div className="md:w-1/3 h-[300px] bg-gray-200"></div>
            <div className="p-6 md:w-2/3">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-24 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return docInfo ? (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Book Appointment</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 h-[300px] relative">
            <img
              src={docInfo.image || "/placeholder.svg"}
              alt={docInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{docInfo.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {docInfo.speciality}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {docInfo.degree}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/chat/${docInfo._id}`)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {docInfo.experience} of experience
            </p>

            <div className="mt-4">
              <h3 className="text-lg font-medium">About</h3>
              <p className="text-gray-600 mt-1 text-sm">{docInfo.about}</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Appointment Fee</h3>
                <p className="text-xl font-bold text-green-600">
                  {currencySymbol}
                  {docInfo.fees}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-b border-gray-100">
          <h3 className="text-xl font-semibold mb-4">
            Select Appointment Date
          </h3>
          {Object.keys(groupedSlots).length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Object.keys(groupedSlots).map((dateStr, index) => {
                const date = new Date(dateStr);
                const { day, date: dateNum, month } = formatDate(date);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center py-3 px-4 min-w-[90px] rounded-lg transition-colors ${
                      selectedDate?.toDateString() === dateStr
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-xs font-medium">{day}</span>
                    <span className="text-lg font-bold my-1">{dateNum}</span>
                    <span className="text-xs">{month}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No available slots</p>
          )}
        </div>

        {selectedDate && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Available Time Slots</h3>
            {timeSlots.length === 0 ? (
              <p className="text-gray-600">No available slots</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {timeSlots.map((slot, idx) => {
                  const slotDate = slot.toISOString().split("T")[0];
                  const slotTime24 = slot.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const slotTime12 = slot.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                  const slotDateTime = `${slotDate} ${slotTime24}`;

                  if (bookedSlotSet.has(slotDateTime)) return null;

                  const isSelected = slotTime === slot.toISOString();

                  return (
                    <button
                      key={idx}
                      onClick={() => setSlotTime(slot.toISOString())}
                      className={`py-2 px-3 rounded-lg text-sm transition-colors relative ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-50 text-gray-800 border border-gray-200 hover:bg-blue-50"
                      }`}
                    >
                      {slotTime12}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={bookAppointment}
            disabled={!slotTime}
            className={`w-full py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
              slotTime
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-[70vh]">
      <p className="text-xl">Doctor not found</p>
    </div>
  );
};

export default Appointment;
