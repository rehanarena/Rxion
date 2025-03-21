import { useState, useEffect, useContext } from "react"
import { DoctorContext } from "../../context/DoctorContext"
import { toast } from "react-toastify"
import { Calendar, Clock, Edit, Trash2, X, Check, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Slot {
  _id: string
  startTime: string
  endTime: string
}

export const ManageSlot = () => {
  const doctorContext = useContext(DoctorContext)
  if (!doctorContext) {
    throw new Error("DoctorContext must be used within a DoctorContextProvider")
  }

  const { backendUrl, profileData } = doctorContext
  const [slots, setSlots] = useState<Slot[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSlots = async () => {
      if (!profileData?._id) return
      try {
        const response = await fetch(`${backendUrl}/api/doctor/${profileData._id}/slots`)
        const data = await response.json()
        if (response.ok) {
          setSlots(data.slots)
        } else {
          toast.error(data.message || "Failed to fetch slots")
        }
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    }

    fetchSlots()
  }, [backendUrl, profileData])

  const handleDelete = async (slotId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/doctor/slots/${slotId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        setSlots((prevSlots) => prevSlots.filter((slot) => slot._id !== slotId))
      } else {
        toast.error(data.message || "Failed to delete slot")
      }
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    }
  }

  const handleEdit = (slot: Slot) => {
    setCurrentSlot(slot)
    setStartTime(slot.startTime)
    setEndTime(slot.endTime)
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    if (!currentSlot) return
    try {
      const response = await fetch(`${backendUrl}/api/doctor/slots/${currentSlot._id}/edit`, {
        method: "PUT",
        body: JSON.stringify({ startTime, endTime }),
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        setSlots((prevSlots) =>
          prevSlots.map((slot) => (slot._id === currentSlot._id ? { ...slot, startTime, endTime } : slot)),
        )
        setIsEditing(false)
      } else {
        toast.error(data.message || "Failed to update slot")
      }
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setCurrentSlot(null)
  }

  const formatTimeOnly = (date: string) => {
    const newDate = new Date(date)
    return newDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDateOnly = (date: string) => {
    const newDate = new Date(date)
    return newDate.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-white">Slot Management</h2>
        <p className="text-blue-100 mt-2">Manage your availability for appointments</p>
      </div>

      {isEditing && currentSlot && (
        <div className="bg-white p-6 rounded-b-xl shadow-lg mb-8 border-t-4 border-indigo-500 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Edit Time Slot</h3>
            <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Start Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={18} className="text-gray-500" />
                </div>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">End Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={18} className="text-gray-500" />
                </div>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={cancelEdit}
              className="mr-4 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check size={18} />
              Update Slot
            </button>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="bg-white p-6 rounded-b-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Your Available Slots</h3>
            <button
              onClick={() => navigate('/doctor-slots')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Slot
            </button>
          </div>

          {slots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map((slot) => (
                <div
                  key={slot._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-700 font-medium">
                      <Calendar size={18} />
                      <span>{formatDateOnly(slot.startTime)}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={18} className="text-gray-500" />
                      <span className="text-gray-800 font-medium">
                        {formatTimeOnly(slot.startTime)} - {formatTimeOnly(slot.endTime)}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(slot._id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Slots Available</h3>
              <p className="text-gray-500 mb-4">You haven't created any availability slots yet.</p>
              <button 
                onClick={() => navigate('/doctor-slots')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Your First Slot
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
