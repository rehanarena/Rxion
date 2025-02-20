import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
  };
  gender: string;
  dob: string;
  image: string;
}

interface AppContextType {
  backendUrl: string;
  token: string | false;
  userData: UserData | false;
  setUserData: React.Dispatch<React.SetStateAction<UserData | false>>;
  loadUserProfileData: () => void;
}

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext) as AppContextType;

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [image, setImage] = useState<File | false>(false);
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    }
  }, [token, loadUserProfileData]); 

  const updateUserProfileData = async () => {
    if (!userData) return;

    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);

      if (image) formData.append("image", image);

      const { data } = await axios.put(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!token || !userData) {
      toast.error("User is not authenticated. Please log in again.");
      return;
    }

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/change-password`,
        {
          userId: userData._id, 
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
  };

  if (!userData) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-purple-100 to-blue-200 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/30">
      <div className="flex justify-center mb-8">
        {isEdit ? (
          <label htmlFor="image" className="cursor-pointer">
            <div className="relative group">
              <img
                className="w-48 h-48 rounded-full object-cover shadow-xl border-4 border-white/50 hover:border-purple-300 transition-all duration-300"
                src={image ? URL.createObjectURL(image) : userData.image}
                alt="Profile"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <img
                  className="w-12"
                  src={assets.upload_icon || "/placeholder.svg"}
                  alt="Upload Icon"
                />
              </div>
            </div>
            <input
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : false)
              }
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <div className="text-center">
            <img
              className="w-48 h-48 rounded-full object-cover shadow-xl border-4 border-white/50"
              src={userData.image || "/placeholder.svg"}
              alt="Profile"
            />
          </div>
        )}
      </div>

      <div className="text-center">
        {isEdit ? (
          <input
            className="w-full mt-4 p-3 text-2xl font-medium bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
            type="text"
          />
        ) : (
          <p className="text-4xl font-bold text-purple-800">{userData.name}</p>
        )}
      </div>

      <hr className="my-8 border-t-2 border-purple-200/50" />

      <div className="bg-white/30 rounded-2xl p-6 mb-8 shadow-lg">
        <p className="text-2xl font-bold text-purple-800 mb-4">
          Contact Information
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p className="font-medium text-purple-600">Email:</p>
            <p className="text-blue-600">{userData.email}</p>
          </div>

          <div>
            <p className="font-medium text-purple-600">Phone:</p>
            {isEdit ? (
              <input
                className="w-full p-3 mt-2 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, phone: e.target.value } : prev
                  )
                }
                type="text"
              />
            ) : (
              <p className="text-gray-600">{userData.phone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <p className="font-medium text-purple-600">Address:</p>
            {isEdit ? (
              <div className="space-y-2 mt-2">
                <input
                  className="w-full p-3 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  onChange={(e) =>
                    setUserData((prev) =>
                      prev
                        ? {
                            ...prev,
                            address: { ...prev.address, line1: e.target.value },
                          }
                        : prev
                    )
                  }
                  value={userData.address.line1}
                  type="text"
                  placeholder="Address Line 1"
                />
                <input
                  className="w-full p-3 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  onChange={(e) =>
                    setUserData((prev) =>
                      prev
                        ? {
                            ...prev,
                            address: { ...prev.address, line2: e.target.value },
                          }
                        : prev
                    )
                  }
                  value={userData.address.line2}
                  type="text"
                  placeholder="Address Line 2"
                />
              </div>
            ) : (
              <p className="text-gray-600">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/30 rounded-2xl p-6 mb-8 shadow-lg">
        <p className="text-2xl font-bold text-purple-800 mb-4">
          Basic Information
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p className="font-medium text-purple-600">Gender:</p>
            {isEdit ? (
              <select
                className="w-full p-3 mt-2 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, gender: e.target.value } : prev
                  )
                }
                value={userData.gender}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-600">{userData.gender}</p>
            )}
          </div>

          <div>
            <p className="font-medium text-purple-600">Birthday:</p>
            {isEdit ? (
              <input
                className="w-full p-3 mt-2 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, dob: e.target.value } : prev
                  )
                }
                value={userData.dob}
                type="date"
              />
            ) : (
              <p className="text-gray-600">{userData.dob}</p>
            )}
          </div>
        </div>
      </div>

      {showPasswordChange && (
        <div className="bg-white/30 rounded-2xl p-6 mb-8 shadow-lg">
          <p className="text-2xl font-bold text-purple-800 mb-4">
            Change Password
          </p>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-purple-600"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 pr-10 mt-1 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
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
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-purple-600"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 mt-1 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-purple-600"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 mt-1 bg-white/50 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={changePassword}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Change Password
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {isEdit ? (
          <button
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
            onClick={updateUserProfileData}
          >
            Save Changes
          </button>
        ) : (
          <button
            className="w-full py-3 bg-white text-purple-500 font-bold rounded-full border border-purple-500 hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
            onClick={() => setIsEdit(true)}
          >
            Edit Profile
          </button>
        )}
        <button
          className="w-full py-3 bg-white text-blue-500 font-bold rounded-full border border-blue-500 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
        >
          <Lock className="mr-2" />
          {showPasswordChange ? "Hide Password Change" : "Change Password"}
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
