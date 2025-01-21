import { useParams, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css'; 
import { AppContext } from "../../context/AppContext"; 

const SlotManagement = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const {  updateDoctorSlots } = useContext(AppContext)!; 
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");

  const generateTimeSlots = () => {
    const slots = [];
    let startTime = 10;
    while (startTime < 21) { 
      const hour = String(startTime).padStart(2, "0");
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
      startTime++;
    }
    slots.push("20:30");
    return slots;
  };

  const timeSlots = generateTimeSlots(); 

  const handleSubmit = () => {
    if (!slotDate || !slotTime) {
      toast.error("Please select both date and time");
      return;
    }

    if (!doctorId) {
      toast.error("Doctor ID is missing");
      return;
    }
    updateDoctorSlots(doctorId, slotDate, slotTime);

    toast.success("Slot availability updated successfully!");
    navigate("/all-doctors");
  };

  return (
    <div className="container mx-auto my-10 p-5 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-5">Slot Management for Doctor ID: {doctorId}</h2>

      <div className="mb-4">
        <label htmlFor="slotDate" className="block text-lg font-medium text-gray-700 mb-2">
          Slot Date:
        </label>
        <input
          id="slotDate"
          type="date"
          value={slotDate}
          onChange={(e) => setSlotDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="slotTime" className="block text-lg font-medium text-gray-700 mb-2">
          Slot Time:
        </label>
        <select
          id="slotTime"
          value={slotTime}
          onChange={(e) => setSlotTime(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Time Slot</option>
          {timeSlots.map((time, index) => (
            <option key={index} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleSubmit} 
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Change Slot
      </button>
    </div>
  );
};

export default SlotManagement;
