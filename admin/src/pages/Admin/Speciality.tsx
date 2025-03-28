import { useState, useEffect, useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import { Edit, Trash2, X, Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Specialty {
  _id: string;
  name: string;
  description: string;
}

const SpecialtyManagement = () => {
  const doctorContext = useContext(DoctorContext);
  if (!doctorContext) {
    throw new Error("DoctorContext must be used within a DoctorContextProvider");
  }

  const { backendUrl } = doctorContext;
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState<Specialty | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  // Fetch all specialties from the backend
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/admin/specialties`);
        const data = await response.json();
        if (response.ok) {
          setSpecialties(data.specialties);
        } else {
          toast.error(data.message || "Failed to fetch specialties");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    };

    fetchSpecialties();
  }, [backendUrl]);

  // Delete a specialty
  const handleDelete = async (specialtyId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/delete-specialties/${specialtyId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setSpecialties((prev) => prev.filter((spec) => spec._id !== specialtyId));
      } else {
        toast.error(data.message || "Failed to delete specialty");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // Enter edit mode with selected specialty data
  const handleEdit = (specialty: Specialty) => {
    setCurrentSpecialty(specialty);
    setName(specialty.name);
    setDescription(specialty.description);
    setIsEditing(true);
  };

  // Update the specialty details with validation
  const handleUpdate = async () => {
    if (!currentSpecialty) return;

    // Validation: Required fields
    if (name.trim() === "" || description.trim() === "") {
      toast.error("Please fill in all fields");
      return;
    }

    // Validation: Minimum length for description
    if (description.trim().length < 10) {
      toast.error("Description should be at least 10 characters long");
      return;
    }

    // Validation: Duplicate check (ignoring current specialty in edit mode)
    const duplicate = specialties.find(
      (spec) =>
        spec.name.toLowerCase() === name.trim().toLowerCase() &&
        spec._id !== currentSpecialty._id
    );
    if (duplicate) {
      toast.error("A specialty with this name already exists");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/edit-specialties/${currentSpecialty._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setSpecialties((prev) =>
          prev.map((spec) =>
            spec._id === currentSpecialty._id ? { ...spec, name, description } : spec
          )
        );
        setIsEditing(false);
        setCurrentSpecialty(null);
      } else {
        toast.error(data.message || "Failed to update specialty");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // Cancel the editing process
  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentSpecialty(null);
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-white">Specialty Management</h2>
        <p className="text-blue-100 mt-2">Manage medical specialties</p>
      </div>

      {/* Edit Specialty Form */}
      {isEditing && currentSpecialty && (
        <div className="bg-white p-6 rounded-b-xl shadow-lg mb-8 border-t-4 border-indigo-500 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Edit Specialty</h3>
            <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Specialty Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              ></textarea>
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
              Update Specialty
            </button>
          </div>
        </div>
      )}

      {/* Specialties List */}
      {!isEditing && (
        <div className="bg-white p-6 rounded-b-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Specialties List</h3>
            <button
              onClick={() => navigate('/add-speciality')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Specialty
            </button>
          </div>
          {specialties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialties.map((specialty) => (
                <div
                  key={specialty._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                    <h4 className="text-lg font-medium text-indigo-700">{specialty.name}</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-4">{specialty.description}</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(specialty)}
                        className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(specialty._id)}
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
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Specialties Available</h3>
              <p className="text-gray-500 mb-4">No specialties have been added yet.</p>
              <button
                onClick={() => navigate('/add-speciality')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Specialty
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecialtyManagement;
