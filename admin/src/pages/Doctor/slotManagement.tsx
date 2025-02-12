import { useState, ChangeEvent, FormEvent, useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';

const SlotForm = () => {
  const doctorContext = useContext(DoctorContext);
  console.log("DoctorContext:", doctorContext);
  if (!doctorContext) {
    throw new Error("DoctorContext must be used within a DoctorContextProvider");
  }

  const { backendUrl,loggedInDoctor } = doctorContext;
  console.log("Logged in Doctor:", loggedInDoctor);

  useEffect(() => {
    console.log("Updated loggedInDoctor:", loggedInDoctor);
  }, [loggedInDoctor]);

  const doctorId = loggedInDoctor?._id || "";

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleDayOfWeekChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDaysOfWeek(Array.from(e.target.selectedOptions, option => option.value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!doctorId) {
      toast.error('No doctor available');
      return;
    }
    if (!startDate || !endDate || !startTime || !endTime) {
      toast.warn('Please fill out all fields');
      return;
    }
    try {
      const response = await fetch(backendUrl + '/api/doctor/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, startDate, endDate, startTime, endTime, daysOfWeek }),
      });
      const data = await response.json();
      console.log(doctorId)
      if (response.ok) {
        toast.success(data.message || 'Slot added successfully');
        setStartDate('');
        setEndDate('');
        setDaysOfWeek([]);
        setStartTime('');
        setEndTime('');
      } else {
        toast.error(data.message || 'Failed to add slot');
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-12 rounded-2xl shadow-lg border border-gray-300">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Add Slot</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-4 border rounded-xl focus:ring focus:ring-blue-400 focus:border-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-4 border rounded-xl focus:ring focus:ring-blue-400 focus:border-blue-500"/>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Days of the Week</label>
          <select multiple value={daysOfWeek} onChange={handleDayOfWeekChange}
            className="w-full p-4 border rounded-xl focus:ring focus:ring-blue-400 focus:border-blue-500">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <option key={day} value={day.slice(0, 2).toUpperCase()}>{day}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-4 border rounded-xl focus:ring focus:ring-blue-400 focus:border-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-4 border rounded-xl focus:ring focus:ring-blue-400 focus:border-blue-500"/>
          </div>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-105">
          Add Slots
        </button>
      </form>
    </div>
  );
};

export default SlotForm;