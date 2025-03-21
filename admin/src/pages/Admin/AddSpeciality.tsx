import { useState, FormEvent, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';

const SpecialtyForm = () => {
  const doctorContext = useContext(DoctorContext);
  if (!doctorContext) {
    throw new Error("DoctorContext must be used within a DoctorContextProvider");
  }

  const { backendUrl } = doctorContext;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.warn('Please fill out all fields');
      return;
    }

    try {
      const response = await fetch(backendUrl + '/api/admin/add-specialties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Specialty added successfully');
        setName('');
        setDescription('');
      } else {
        toast.error(data.message || 'Failed to add specialty');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 rounded-2xl shadow-lg border border-gray-300">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Add Specialty</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Specialty Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter specialty name"
            className="w-full p-4 border rounded-xl focus:ring focus:ring-blue-400 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter specialty description"
            rows={4}
            className="w-full p-4 border rounded-xl focus:ring focus:ring-blue-400 focus:border-blue-500"
          ></textarea>
        </div>
        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-105"
        >
          Add Specialty
        </button>
      </form>
    </div>
  );
};

export default SpecialtyForm;
