import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

interface Address {
  line1: string;
  line2: string;
}

interface ProfileData {
  _id: string;
  name: string;
  degree: string;
  speciality: string;
  experience: string;
  about: string;
  fees: number;
  address: Address;
  available: boolean;
  image: string | null; 
}

interface DoctorContextType {
  backendUrl: string;
  dToken: string;
  profileData: ProfileData | null; // profileData can be null initially
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  getLoggedInDoctor: () => void;
}

const DoctorProfile = () => {
  const { backendUrl, dToken, profileData, setProfileData, getLoggedInDoctor } =
    useContext(DoctorContext) as DoctorContextType;

  const [isEdit, setIsEdit] = useState<boolean>(false);

  // Fetch logged-in doctor's profile data
  const getProfileData = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dToken },
      });

      if (data.success && data.profileData) {
        setProfileData(data.profileData); // Update profile data
      } else {
        toast.error(data.message || "Failed to fetch doctor profile");
      }
    } catch (error) {
      toast.error("Failed to fetch doctor profile");
    }
  };

  const updateProfile = async () => {
    try {
      if (!profileData) return;
  
      const updateData = {
        docId: profileData._id, // Include the doctor's ID
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
      };
  
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updateData,
        { headers: { dToken } }
      );
  
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData(); // Re-fetch profile after updating
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };
  

  useEffect(() => {
    console.log("Doctor Data AFTER state update:", profileData);
  }, [profileData]);

  if (!profileData) {
    return <div>Loading...</div>; // Add loading state
  }

  return (
    <div>
      <div className="flex flex-col gap-4 m-5">
        <div>
          {profileData.image ? (
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
              src={profileData.image}
              alt="Doctor"
            />
          ) : (
            <div className="bg-gray-300 w-full sm:max-w-64 rounded-lg h-64 flex items-center justify-center">
              <span>No Image Available</span>
            </div>
          )}
        </div>

        <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {profileData.name}
          </p>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <p>
              {profileData.degree} - {profileData.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {profileData.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
              About:
            </p>
            <p className="text-sm text-gray-600 max-w-[700px] mt-1">
              {profileData.about}
            </p>
          </div>
          <p className="text-gray-600 font-medium mt-4">
            Appointment fees:{" "}
            {isEdit ? (
              <input
                className="px-2 py-1 w-20 ml-5"
                type="number"
                onChange={(e) =>
                  setProfileData((prev) => {
                    if (prev) {
                      return { ...prev, fees: +e.target.value };
                    }
                    return prev; // Avoid modifying profileData if it's null
                  })
                }
                value={profileData.fees}
              />
            ) : (
              <span className="text-gray-800">{profileData.fees}</span>
            )}
            ₹
          </p>
          <div className="flex gap-2 py-2">
            <p>Address:</p>
            <p className="text-sm">
              {isEdit ? (
                <input
                  type="text"
                  onChange={(e) =>
                    setProfileData((prev) => {
                      if (prev) {
                        return {
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        };
                      }
                      return prev; // Avoid modifying profileData if it's null
                    })
                  }
                  value={profileData.address.line1}
                />
              ) : (
                profileData.address?.line1
              )}
              <br />
              {isEdit ? (
                <input
                  type="text"
                  onChange={(e) =>
                    setProfileData((prev) => {
                      if (prev) {
                        return {
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        };
                      }
                      return prev; // Avoid modifying profileData if it's null
                    })
                  }
                  value={profileData.address.line2}
                />
              ) : (
                profileData.address?.line2
              )}
            </p>
          </div>
          <div className="flex gap-1 pt-2">
            <input
              onChange={() =>
                isEdit &&
                setProfileData((prev) => {
                  if (prev) {
                    return {
                      ...prev,
                      available: !prev.available,
                    };
                  }
                  return prev; // Avoid modifying profileData if it's null
                })
              }
              checked={profileData.available}
              type="checkbox"
              name=""
              id=""
            />
            <label htmlFor="">Available</label>
          </div>

          {isEdit ? (
            <button
              onClick={updateProfile}
              className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
