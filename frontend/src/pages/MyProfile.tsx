import React, { useState } from "react";
import { assets } from "../assets/assets";

interface Address {
  line1: string;
  line2: string;
}

interface UserData {
  name: string;
  image: string;
  email: string;
  phone: string;
  address: Address;
  gender: "Male" | "Female";
  DOB: string;
}

const MyProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "Rehana",
    image: assets.profile_pic,
    email: "rena@gmail.com",
    phone: "+971 589325787",
    address: {
      line1: "Street 123",
      line2: "Near bus stop, India",
    },
    gender: "Female",
    DOB: "2002-03-04",
  });

  const [isEdit, setIsEdit] = useState<boolean>(false);

  return (
    <div className="max-w-lg mx-auto p-6 shadow-lg rounded-lg bg-white text-gray-700">
      {/* Profile Image */}
      <div className="flex flex-col items-center mb-6">
        <img
          className="w-36 h-36 rounded-full object-cover border-2 border-primary shadow-md"
          src={userData.image}
          alt="Profile"
        />
        {isEdit ? (
          <input
            className="bg-gray-50 text-xl font-medium text-center mt-4 border border-gray-300 rounded-lg p-2"
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        ) : (
          <p className="font-medium text-2xl text-neutral-800 mt-4">
            {userData.name}
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div>
        <p className="text-neutral-500 underline font-semibold">Contact Information</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-3 mt-4 text-neutral-700">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500">{userData.email}</p>

          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 w-full p-2 border border-gray-300 rounded-lg"
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          ) : (
            <p>{userData.phone}</p>
          )}

          <p className="font-medium">Address:</p>
          {isEdit ? (
            <div>
              <input
                className="bg-gray-50 mb-2 w-full p-2 border border-gray-300 rounded-lg"
                type="text"
                value={userData.address.line1}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
              />
              <input
                className="bg-gray-50 w-full p-2 border border-gray-300 rounded-lg"
                type="text"
                value={userData.address.line2}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
              />
            </div>
          ) : (
            <p>
              {userData.address.line1} <br />
              {userData.address.line2}
            </p>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="mt-6">
        <p className="text-neutral-500 underline font-semibold">Basic Information</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-3 mt-4 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="bg-gray-100 w-full p-2 border border-gray-300 rounded-lg"
              value={userData.gender}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, gender: e.target.value as "Male" | "Female" }))
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p>{userData.gender}</p>
          )}

          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 w-full p-2 border border-gray-300 rounded-lg"
              type="date"
              value={userData.DOB}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, DOB: e.target.value }))
              }
            />
          ) : (
            <p>{userData.DOB}</p>
          )}
        </div>
      </div>

      {/* Edit/Save Button */}
      <div className="mt-8 text-center">
        <button
          className="px-8 py-2 rounded-full text-white bg-primary hover:bg-primary-dark transition-all"
          onClick={() => setIsEdit((prev) => !prev)}
        >
          {isEdit ? "Save Information" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
