import { useState, useEffect, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
}

const SlotManagement = () => {
  const doctorContext = useContext(DoctorContext);
  if (!doctorContext) {
    throw new Error("DoctorContext must be used within a DoctorContextProvider");
  }

  const { backendUrl, loggedInDoctor } = doctorContext;
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      if (!loggedInDoctor?._id) return;
      try {
        const response = await fetch(`${backendUrl}/api/doctor/${loggedInDoctor._id}/slots`);
        const data = await response.json();
        if (response.ok) {
          setSlots(data.slots);
        } else {
          toast.error(data.message || 'Failed to fetch slots');
        }
      } catch (error) {
        console.log(error)
        toast.error('Something went wrong');
      }
    };

    fetchSlots();
  }, [backendUrl, loggedInDoctor]);

  const handleDelete = async (slotId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/doctor/slots/${slotId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setSlots((prevSlots) => prevSlots.filter((slot) => slot._id !== slotId));
      } else {
        toast.error(data.message || 'Failed to delete slot');
      }
    } catch (error) {
        console.log(error)
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (slot: Slot) => {
    setCurrentSlot(slot);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!currentSlot) return;
    try {
      const response = await fetch(`${backendUrl}/api/doctor/slots/${currentSlot._id}/edit`, {
        method: 'PUT',
        body: JSON.stringify({ startTime, endTime }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot._id === currentSlot._id ? { ...slot, startTime, endTime } : slot
          )
        );
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update slot');
      }
    } catch (error) {
        console.log(error)
      toast.error('Something went wrong');
    }
  };

  const formatDate = (date: string) => {
    const newDate = new Date(date);
    return newDate.toLocaleString(); 
  };

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Slot Management</h2>
      
      {isEditing && currentSlot && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit Slot</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Slot
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.length > 0 ? (
          slots.map((slot) => (
            <div key={slot._id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-700">
                  {formatDate(slot.startTime)} - {formatDate(slot.endTime)}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(slot)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot._id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-lg text-gray-500">No slots available</div>
        )}
      </div>
    </div>
  );
};

export default SlotManagement;
