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

  console.log('userdata:', userData);

  // useEffect to load user profile data when token changes
  useEffect(() => {
    if (token) {
      loadUserProfileData();
    }
  }, [token]);  // This runs every time the token changes

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

      const { data } = await axios.post(
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
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      {
        isEdit ? 
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img className="w-36 rounded opacity-75" src={image ? URL.createObjectURL(image) : userData.image} alt="Profile" />
              <img className="w-12 absolute bottom-12 right-12" src={image ? '' : assets.upload_icon} alt="Upload Icon" />
            </div>
            <input onChange={(e) => setImage(e.target.files ? e.target.files[0] : false)} type="file" id="image" hidden />
          </label> :
          <img className="w-36 rounded" src={userData.image} alt="Profile" />
      }

      {isEdit ? (
        <input
          className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          value={userData.name}
          onChange={(e) => setUserData((prev) => prev ? { ...prev, name: e.target.value } : prev)}
          type="text"
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">
          {userData.name}
        </p>
      )}

      <hr className="bg-zinc-400 h-[1px] border-none" />

      <div>
        <p className="text-neutral-700 underline mt-3 mb-3">
          CONTACT INFORMATION
        </p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500">{userData.email}</p>
          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              value={userData.phone}
              onChange={(e) => setUserData((prev) => prev ? { ...prev, phone: e.target.value } : prev)}
              type="text"
            />
          ) : (
            <p className="text-blue-400">{userData.phone}</p>
          )}
          <p className="font-medium">Address:</p>
          {isEdit ? (
            <div>
              <input
                className="bg-gray-50"
                onChange={(e) => setUserData((prev) => prev ? { ...prev, address: { ...prev.address, line1: e.target.value } } : prev)}
                value={userData.address.line1}
                type="text"
              />
              <br />
              <input
                className="bg-gray-50"
                onChange={(e) => setUserData((prev) => prev ? { ...prev, address: { ...prev.address, line2: e.target.value } } : prev)}
                value={userData.address.line2}
                type="text"
              />
            </div>
          ) : (
            <p className="text-gray-500">
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </p>
          )}
        </div>

        <div>
          <p className="text-neutral-700 underline mt-3 mb-3">
            BASIC INFORMATION
          </p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                className="max-w-20 bg-gray-100"
                onChange={(e) => setUserData((prev) => prev ? { ...prev, gender: e.target.value } : prev)}
                value={userData.gender}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-500">{userData.gender}</p>
            )}

            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                className="max-w-28 bg-gray-100"
                onChange={(e) => setUserData((prev) => prev ? { ...prev, dob: e.target.value } : prev)}
                value={userData.dob}
                type="date"
              />
            ) : (
              <p className="text-gray-500">{userData.dob}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        {isEdit ? (
          <button className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all" onClick={updateUserProfileData}>Save</button>
        ) : (
          <button className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all" onClick={() => setIsEdit(true)}>Edit</button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
