import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from '../assets/assets';
import axios from "axios";
import { toast } from "react-toastify";

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
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext) as AppContextType;

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [image, setImage] = useState<File | false>(false);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    }
  }, [token]);

  const updateUserProfileData = async () => {
    if (!userData) return;

    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      formData.append('address', JSON.stringify(userData.address));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob);

      if (image) formData.append('image', image);

      const { data } = await axios.put(
        backendUrl + '/api/user/update-profile',
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
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  if (!userData) return null;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/30">
      <div className="flex justify-center mb-8">
        {isEdit ? (
          <label htmlFor="image" className="cursor-pointer">
            <div className="relative group">
              <img
                className="w-40 h-40 rounded-full object-cover shadow-xl border-4 border-white/50 hover:border-blue-300 transition-all duration-300"
                src={image ? URL.createObjectURL(image) : userData.image}
                alt="Profile"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <img
                  className="w-12"
                  src={assets.upload_icon}
                  alt="Upload Icon"
                />
              </div>
            </div>
            <input
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : false)}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <div className="text-center">
            <img
              className="w-40 h-40 rounded-full object-cover shadow-xl border-4 border-white/50"
              src={userData.image}
              alt="Profile"
            />
          </div>
        )}
      </div>
      <div className="text-center">
        {isEdit ? (
          <input
            className="w-full mt-4 p-3 text-xl font-medium bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={userData.name}
            onChange={(e) => setUserData((prev) => prev ? { ...prev, name: e.target.value } : prev)}
            type="text"
          />
        ) : (
          <p className="text-3xl font-bold text-gray-800">{userData.name}</p>
        )}
      </div>

      <hr className="my-6 border-t-2 border-gray-200/50" />
      <div>
        <p className="text-xl font-bold text-gray-800 mb-4">Contact Information</p>
        <div className="grid grid-cols-1 gap-y-4 text-gray-700">
          <div>
            <p className="font-medium">Email:</p>
            <p className="text-blue-600">{userData.email}</p>
          </div>

          <div>
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                className="w-full p-3 mt-2 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={userData.phone}
                onChange={(e) => setUserData((prev) => prev ? { ...prev, phone: e.target.value } : prev)}
                type="text"
              />
            ) : (
              <p className="text-gray-600">{userData.phone}</p>
            )}
          </div>

          <div>
            <p className="font-medium">Address:</p>
            {isEdit ? (
              <div className="space-y-2">
                <input
                  className="w-full p-3 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setUserData((prev) => prev ? { ...prev, address: { ...prev.address, line1: e.target.value } } : prev)}
                  value={userData.address.line1}
                  type="text"
                />
                <input
                  className="w-full p-3 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setUserData((prev) => prev ? { ...prev, address: { ...prev.address, line2: e.target.value } } : prev)}
                  value={userData.address.line2}
                  type="text"
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
      <div className="mt-8">
        <p className="text-xl font-bold text-gray-800 mb-4">Basic Information</p>
        <div className="grid grid-cols-1 gap-y-4 text-gray-700">
          <div>
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                className="w-full p-3 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => setUserData((prev) => prev ? { ...prev, gender: e.target.value } : prev)}
                value={userData.gender}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-600">{userData.gender}</p>
            )}
          </div>

          <div>
            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                className="w-full p-3 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => setUserData((prev) => prev ? { ...prev, dob: e.target.value } : prev)}
                value={userData.dob}
                type="date"
              />
            ) : (
              <p className="text-gray-600">{userData.dob}</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-12 text-center">
        {isEdit ? (
          <button
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-white text-blue-500 font-bold rounded-full hover:from-blue-600 hover:to-white transition-all shadow-lg hover:shadow-xl"
            onClick={updateUserProfileData}
          >
            Save Changes
          </button>
        ) : (
          <button
            className="w-full py-3 bg-white text-blue-500 font-bold rounded-full border border-blue-500 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            onClick={() => setIsEdit(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
