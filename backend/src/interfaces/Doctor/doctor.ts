export interface AddDoctorRequestBody {
    name: string;
    email: string;
    password: string;
    speciality: string;
    degree: string;
    experience: string;
    about: string;
    fees: string;
    address: string;
  }

  interface Address{
    line1: string,
    line2: string
  }
 export interface UpdateDoctorProfileData {
    fees: number;
    address: Address; // or string, depending on your schema
    available: boolean;
    experience: string;
    about: string;
  }

  export interface Doctor {
      _id: string;
      name: string;
      email: string;
      image: string;
      degree: string;
      speciality: string;
      isBlocked: boolean;
      available: boolean;
      experience: string;
      about: string;
      fees: number;
      slots_booked: Record<string, string[]> | null;
    }
 export interface DoctorData {
    image: string;
    name: string;
    speciality: string;
    degree: string;
    fees: number;
  }
