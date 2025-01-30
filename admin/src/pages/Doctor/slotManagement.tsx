import { useState, useEffect, useContext } from "react";
import { RRule, Weekday } from "rrule";
import { DoctorContext } from "../../context/DoctorContext";
import { jwtDecode } from "jwt-decode"

interface DoctorContextType {
  dToken: string | null;
  backendUrl: string;
}

interface DecodedToken {
  id: string;
}

const DoctorSlotManagement = () => {
  const [day, setDay] = useState<string>("MON");
  const [recurringTime, setRecurringTime] = useState<string>("");
  const [recurringEndTime, setRecurringEndTime] = useState<string>("");
  const [specificTime, setSpecificTime] = useState<string>("");
  const [specificDate, setSpecificDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [recurringSlots, setRecurringSlots] = useState<string[]>([]);

  const { dToken, backendUrl } = useContext(DoctorContext) as DoctorContextType;

  // Decode the token to extract docId
  const decodeToken = (token: string | null): string | null => {
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.id; // Assuming the token contains docId
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  // Fetch slots from the database
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        console.log("dToken:", dToken);
  
        if (!dToken) {
          throw new Error("Doctor token is missing or invalid.");
        }
  
        // Decode the token and extract the id (doctor ID)
        const decoded = jwtDecode<DecodedToken>(dToken);
        console.log("Decoded token:", decoded);
  
        if (!decoded.id) {
          throw new Error("Doctor ID not found in the token.");
        }
  
        // Pass the specificDate if it's available, else pass an empty string or null
        const queryDate = specificDate ? `&date=${specificDate}` : "";
  
        const response = await fetch(`${backendUrl}/api/doctor/get-slots/${decoded.id}?date=${queryDate}`);
        console.log("API Response:", response);
  
        if (!response.ok) {
          throw new Error(`Failed to fetch slots: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Fetched Data:", data);
  
        if (data.success) {
          setSlots(data.specificSlots || []);  // Ensure the API returns these fields
          setRecurringSlots(data.recurringSlots || []);
        } else {
          console.error("Failed to fetch slots:", data.message);
        }
      } catch (error) {
        console.error("Error fetching slots:", error.message);
      }
    };
  
    fetchSlots();
  }, [dToken, backendUrl, specificDate]);  // Add specificDate as a dependency
  

  interface SlotData {
    date?: string; // For specific slots
    time: string;
    endTime?: string;
    day?: string; // For recurring slots
    type: "specific" | "recurring";
  }

  const handleSaveSlot = async (slotData: SlotData) => {
    try {
      const docId = decodeToken(dToken);
      if (!docId) {
        console.error("Doctor ID not found in the token.");
        return;
      }

      const response = await fetch(`${backendUrl}/api/doctor/${docId}/add-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slotData),
      });

      const data = await response.json();
      if (!data.success) {
        alert("Failed to save slot.");
      } else {
        alert("Slot saved successfully!");
      }
    } catch (error) {
      console.error("Error saving slot:", error);
    }
  };

  const handleAddRecurringSlot = async () => {
    if (!recurringTime || !recurringEndTime) {
      alert("Please select both start time and end time.");
      return;
    }

    const dayMap: { [key: string]: Weekday } = {
      MON: RRule.MO,
      TUE: RRule.TU,
      WED: RRule.WE,
      THU: RRule.TH,
      FRI: RRule.FR,
      SAT: RRule.SA,
      SUN: RRule.SU,
    };

    const selectedDay = dayMap[day];
    if (!selectedDay) {
      alert("Invalid day selected.");
      return;
    }

    const rule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [selectedDay],
      count: 10, // Generates 10 weeks of recurring slots
    });

    const newRecurringSlots = rule.all().map((slot: Date) => {
      const slotStartTime = `${slot.toISOString().split("T")[0]} ${recurringTime}`;
      const slotEndTime = `${slot.toISOString().split("T")[0]} ${recurringEndTime}`;
      return `${slotStartTime} to ${slotEndTime}`;
    });

    if (newRecurringSlots.length > 0) {
      setRecurringSlots([...recurringSlots, ...newRecurringSlots]);
      handleSaveSlot({
        type: "recurring",
        day,
        time: recurringTime,
        endTime: recurringEndTime,
      });
    } else {
      alert("No recurring slots available.");
    }
  };

  const handleAddSpecificSlot = () => {
    if (!specificDate || !specificTime) {
      alert("Please select both date and time.");
      return;
    }
    const newSlot = `${specificDate} ${specificTime}`;
    setSlots([...slots, newSlot]);
    handleSaveSlot({ type: "specific", date: specificDate, time: specificTime });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Manage Slots
        </h1>

        {/* Add Recurring Slot */}
        <div className="space-y-4">
          <h2 className="text-2xl font-medium text-gray-700">Add Recurring Slot</h2>
          <div className="flex flex-col space-y-2">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input
              type="time"
              value={recurringTime}
              onChange={(e) => setRecurringTime(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="time"
              value={recurringEndTime}
              onChange={(e) => setRecurringEndTime(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
            onClick={handleAddRecurringSlot}
          >
            Add Recurring Slot
          </button>

          {/* Display Recurring Slots */}
          <div>
            <h3 className="text-xl font-medium text-gray-700">Recurring Slots</h3>
            <ul>
              {recurringSlots.map((slot, index) => (
                <li key={index} className="flex justify-between border-b py-2">
                  {slot}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Add Specific Slot */}
        <div className="space-y-4 mt-6">
          <h2 className="text-2xl font-medium text-gray-700">Add Specific Slot</h2>
          <div className="flex flex-col space-y-2">
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="time"
              value={specificTime}
              onChange={(e) => setSpecificTime(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
            onClick={handleAddSpecificSlot}
          >
            Add Specific Slot
          </button>

          {/* Display Specific Slots */}
          <div>
            <h3 className="text-xl font-medium text-gray-700">Specific Slots</h3>
            <ul>
              {slots.map((slot, index) => (
                <li key={index} className="flex justify-between border-b py-2">
                  {slot}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSlotManagement;
