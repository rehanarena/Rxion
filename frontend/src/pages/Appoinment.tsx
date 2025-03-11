"use client"

import type React from "react"

import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { DoctorContext } from "../context/DoctorContext"
import { toast } from "react-toastify"
import axios from "axios"

interface BookedSlot {
  date: string
  time: string
}

interface Doctor {
  _id: string
  image: string
  name: string
  speciality: string
  available: boolean
  degree: string
  experience: string
  about: string
  fees: number
  slots_booked?: { [key: string]: BookedSlot[] }
}

const Appointment: React.FC = () => {
  const { docId } = useParams<{ docId: string }>()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)!
  const { docSlots, fetchSlots } = useContext(DoctorContext)!
  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slotTime, setSlotTime] = useState<string>("")

  useEffect(() => {
    if (docId && doctors.length > 0) {
      fetchDocInfo();
      fetchSlots(docId);
    }
  }, [docId, doctors, fetchSlots]);
  

  const fetchDocInfo = () => {
    const doc = doctors.find((doctor: Doctor) => doctor._id === docId)
    setDocInfo(doc || null)
  }

  const addBookedSlotToDocInfo = (newSlot: BookedSlot) => {
    if (!docInfo) return
    const updatedDocInfo = { ...docInfo }
    if (!updatedDocInfo.slots_booked) {
      updatedDocInfo.slots_booked = {}
    }
    if (!updatedDocInfo.slots_booked[newSlot.date]) {
      updatedDocInfo.slots_booked[newSlot.date] = []
    }
    updatedDocInfo.slots_booked[newSlot.date].push(newSlot)
    setDocInfo(updatedDocInfo)
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment")
      return navigate("/login")
    }

    try {
      const selectedSlot = docSlots.find((slot) => {
        const slotStartTime = new Date(slot.startTime)
        const slotEndTime = new Date(slot.endTime)
        const selectedTime = new Date(slotTime)
        return selectedTime >= slotStartTime && selectedTime <= slotEndTime
      })

      if (!selectedSlot) {
        toast.warn("Please select a valid slot.")
        return
      }

      const slotDate = new Date(selectedSlot.startTime).toISOString().split("T")[0]

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (data.success) {
        toast.success(data.message)

        const formattedSlotTime = new Date(slotTime).toISOString()
        const slotDatePart = formattedSlotTime.split("T")[0]
        const slotTimePart = new Date(formattedSlotTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })

        const newSlot: BookedSlot = {
          date: slotDatePart,
          time: slotTimePart,
        }

        addBookedSlotToDocInfo(newSlot)

        getDoctorsData()
        navigate("/my-appointments")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const generateHalfHourSlots = (startTime: string, endTime: string) => {
    const slots: Date[] = []
    const start = new Date(startTime)
    const end = new Date(endTime)
    while (start < end) {
      slots.push(new Date(start))
      start.setMinutes(start.getMinutes() + 30)
    }
    return slots
  }

  const getBookedSlots = (): BookedSlot[] => {
    const booked: BookedSlot[] = []
    if (docInfo?.slots_booked) {
      Object.values(docInfo.slots_booked).forEach((slotArray) => {
        if (Array.isArray(slotArray)) {
          slotArray.forEach((slot: BookedSlot) => {
            if (slot.date && slot.time) {
              booked.push(slot)
            }
          })
        } else {
          console.warn('Expected an array but got:', slotArray)
        }
      })
      
    }
    return booked
  }

  const today = new Date()
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(today.getDate() + 7)

  const bookedSlots = getBookedSlots()
  const bookedSlotSet = new Set(bookedSlots.map((b) => `${b.date} ${b.time}`))

  const availableDocSlots = docSlots.filter((slot) => {
    const slotDateObj = new Date(slot.startTime)
    const slotDate = slotDateObj.toISOString().split("T")[0]
    const slotTimeFormatted = slotDateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const slotDateTime = `${slotDate} ${slotTimeFormatted}`
    return slotDateObj >= today && slotDateObj <= sevenDaysLater && !bookedSlotSet.has(slotDateTime)
  })

  const groupedSlots = availableDocSlots.reduce(
    (acc, slot) => {
      const slotDateStr = new Date(slot.startTime).toDateString()
      if (!acc[slotDateStr]) {
        acc[slotDateStr] = []
      }
      acc[slotDateStr].push(slot)
      return acc
    },
    {} as { [key: string]: typeof docSlots },
  )

  const slotsForSelectedDate = groupedSlots[selectedDate.toDateString()] || []

  const timeSlotsSet = new Set<string>()
  const timeSlots: Date[] = []
  slotsForSelectedDate.forEach((slot) => {
    const halfHourSlots = generateHalfHourSlots(slot.startTime, slot.endTime)
    halfHourSlots.forEach((time) => {
      const iso = time.toISOString()
      if (!timeSlotsSet.has(iso)) {
        timeSlotsSet.add(iso)
        timeSlots.push(time)
      }
    })
  })
  timeSlots.sort((a, b) => a.getTime() - b.getTime())

  return docInfo ? (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Book Appointment</h1>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img src={docInfo.image || "/placeholder.svg"} alt={docInfo.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold mb-2">{docInfo.name}</h2>
              <button
  onClick={() => navigate(`/chat/${docInfo?._id}`)}
  className="ml-4 p-2 rounded-full hover:bg-gray-200"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.97-4.03 9-9 9a9.93 9.93 0 01-4.465-1.026L3 21l1.026-4.465A9.93 9.93 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z"
    />
  </svg>
</button>

            </div>
            <p className="text-gray-600 mb-4">
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <p className="text-sm text-gray-500 mb-4">{docInfo.experience} of experience</p>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">About</h3>
              <p className="text-gray-600">{docInfo.about}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Appointment Fee</h3>
              <p className="text-xl font-bold text-green-600">
                {currencySymbol}
                {docInfo.fees}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Select Appointment Date</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.keys(groupedSlots).map((dateStr, index) => {
              const date = new Date(dateStr)
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                    selectedDate.toDateString() === dateStr
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 hover:bg-blue-100"
                  }`}
                >
                  <span className="text-sm font-semibold">{date.toLocaleDateString([], { weekday: "short" })}</span>
                  <span className="text-lg font-bold">{date.toLocaleDateString([], { day: "numeric" })}</span>
                  <span className="text-sm">{date.toLocaleDateString([], { month: "short" })}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Available Time Slots</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {timeSlots.map((slot, idx) => {
              const slotDate = slot.toISOString().split("T")[0]
              const slotTime24 = slot.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              const slotTime12 = slot.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              const slotDateTime = `${slotDate} ${slotTime24}`

              if (bookedSlotSet.has(slotDateTime)) return null

              return (
                <button
                  key={idx}
                  onClick={() => setSlotTime(slot.toISOString())}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    slotTime === slot.toISOString()
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                  }`}
                >
                  {slotTime12}
                </button>
              )
            })}
          </div>
        </div>
        <div className="p-6 bg-gray-50">
          <button
            onClick={bookAppointment}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl">Loading...</p>
    </div>
  )
}

export default Appointment
