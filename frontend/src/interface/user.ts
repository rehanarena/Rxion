export interface AppContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  backendUrl: string;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  loadUserProfileData: () => void;
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  getDoctorsData: () => void;
  currencySymbol: string;
}


export interface UserData {
    _id: string;
    name: string;
    email: string;
    image?: string;
  }

  export interface Doctor {
    _id: string;
    name: string;
    email: string;
    speciality: string;
    image: string;
    available: boolean;
    degree: string;
    experience: string;
    about: string;
    fees: number;
  }