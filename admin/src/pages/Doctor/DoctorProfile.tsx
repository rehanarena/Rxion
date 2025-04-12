import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, Edit, Save, User, Stethoscope, DollarSign, MapPin, ClipboardCheck } from "lucide-react";
import { ProfileData } from "../../Interfaces/Doctor";

const DoctorProfile = () => {
  const { backendUrl, dToken, profileData, setProfileData } = useContext(DoctorContext)!;
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState<boolean>(false);

  const getProfileData = async () => {
    if (!dToken) {
      console.log("No dToken found, skipping profile fetch.");
      return;
    }
    try {
      console.log("Fetching doctor profile...");
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dToken },
      });
      console.log("API Response:", data);
      if (data.success && data.profileData) {
        console.log("Fetched Doctor ID:", data.profileData._id);
        setProfileData(data.profileData);
      } else {
        console.log("Profile data missing in response.");
        toast.error(data.message || "Failed to fetch doctor profile");
      }
    } catch (error) {
      console.error("API request failed:", error);
      toast.error("Failed to fetch doctor profile");
    }
  };

  useEffect(() => {
    getProfileData();
  }, [dToken]);

  useEffect(() => {
    console.log("Doctor Data AFTER state update:", profileData);
  }, [profileData]);

  const updateProfile = async () => {
    if (!profileData) return;
    try {
      const updateData = {
        docId: profileData._id,
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
        experience: profileData.experience,
        about: profileData.about,
      };
      console.log("Update Payload:", updateData);

      const { data } = await axios.post(`${backendUrl}/api/doctor/update-profile`, updateData, {
        headers: { dToken },
      });
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill out all the password fields.");
      return;
    }

    if (newPassword.length < 7) {
      toast.error("New password should be at least 7 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!dToken || !profileData) {
      toast.error("User is not authenticated. Please log in again.");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/change-password`,
        {
          doctorId: profileData._id,
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            dToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
    setIsPasswordLoading(false);
  };

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        
        <div className="px-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileData.image ? (
                <img
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover"
                  src={profileData.image}
                  alt="Doctor"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 pt-4 md:pt-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{profileData.name}</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Stethoscope size={16} className="mr-1" />
                    <span className="mr-2">{profileData.degree} - {profileData.speciality}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {profileData.experience}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => isEdit ? updateProfile() : setIsEdit(true)}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isEdit ? "#3730A3" : "transparent",
                    color: isEdit ? "white" : "#1E293B",
                    border: isEdit ? "none" : "1px solid #334155",
                    fontWeight: "600"
                  }}
                >
                  {isEdit ? (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit size={16} />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pb-6">
            <div className="md:col-span-2 space-y-6">
              {/* Experience Section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-gray-700 font-semibold mb-2 flex items-center">
                  <ClipboardCheck size={18} className="mr-2 text-blue-500" />
                  Experience
                </h3>
                {isEdit ? (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setProfileData((prev: ProfileData | null) =>
                        prev ? { ...prev, experience: e.target.value } : prev
                      )
                    }
                    value={profileData.experience}
                  />
                ) : (
                  <p className="text-gray-600">{profileData.experience}</p>
                )}
              </div>
              
              {/* About Section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-gray-700 font-semibold mb-2 flex items-center">
                  <User size={18} className="mr-2 text-blue-500" />
                  About
                </h3>
                {isEdit ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                    onChange={(e) =>
                      setProfileData((prev: ProfileData | null) =>
                        prev ? { ...prev, about: e.target.value } : prev
                      )
                    }
                    value={profileData.about}
                  />
                ) : (
                  <p className="text-gray-600">{profileData.about}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Fees Section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-gray-700 font-semibold mb-2 flex items-center">
                  <DollarSign size={18} className="mr-2 text-blue-500" />
                  Appointment Fees
                </h3>
                <div className="flex items-center">
                  {isEdit ? (
                    <input
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="number"
                      onChange={(e) =>
                        setProfileData((prev: ProfileData | null) =>
                          prev ? { ...prev, fees: +e.target.value } : prev
                        )
                      }
                      value={profileData.fees}
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-800">{profileData.fees}</span>
                  )}
                  <span className="ml-1 text-gray-600">₹</span>
                </div>
              </div>
              
              {/* Address Section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-gray-700 font-semibold mb-2 flex items-center">
                  <MapPin size={18} className="mr-2 text-blue-500" />
                  Address
                </h3>
                {isEdit ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Address Line 1"
                      onChange={(e) =>
                        setProfileData((prev: ProfileData | null) =>
                          prev ? { ...prev, address: { ...prev.address, line1: e.target.value } } : prev
                        )
                      }
                      value={profileData.address.line1}
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Address Line 2"
                      onChange={(e) =>
                        setProfileData((prev: ProfileData | null) =>
                          prev ? { ...prev, address: { ...prev.address, line2: e.target.value } } : prev
                        )
                      }
                      value={profileData.address.line2}
                    />
                  </div>
                ) : (
                  <address className="text-gray-600 not-italic">
                    {profileData.address?.line1}<br />
                    {profileData.address?.line2}
                  </address>
                )}
              </div>
              
              {/* Availability Section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-gray-700 font-semibold mb-2">Availability</h3>
                <div className="flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="availability-toggle"
                      className="opacity-0 absolute h-0 w-0"
                      onChange={() =>
                        isEdit &&
                        setProfileData((prev: ProfileData | null) =>
                          prev ? { ...prev, available: !prev.available } : prev
                        )
                      }
                      checked={profileData.available}
                      disabled={!isEdit}
                    />
                    <label
                      htmlFor="availability-toggle"
                      className={`block overflow-hidden h-6 rounded-full cursor-${isEdit ? 'pointer' : 'not-allowed'} ${
                        profileData.available ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                      style={{ transition: 'background-color 0.3s ease' }}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform ${
                          profileData.available ? 'translate-x-4' : 'translate-x-0'
                        }`}
                        style={{ transition: 'transform 0.3s ease' }}
                      ></span>
                    </label>
                  </div>
                  <span className={`text-sm ${profileData.available ? 'text-green-600' : 'text-gray-500'}`}>
                    {profileData.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Change Password Section */}
      <div className="mt-8">
        <button
          className="w-full py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-300 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
        >
          <Lock className="mr-2" size={18} />
          {showPasswordChange ? "Hide Password Change" : "Change Password"}
        </button>

        {showPasswordChange && (
          <div className="mt-4 bg-white rounded-xl p-6 shadow-md">
            <p className="text-xl font-bold text-gray-800 mb-4">Change Password</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 pr-10 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                onClick={changePassword}
                disabled={isPasswordLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-70"
              >
                {isPasswordLoading ? "Changing Password..." : "Change Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;