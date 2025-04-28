export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserData {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export interface SearchParams {
  speciality?: string;
  search?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

export interface UpdateProfileRequestBody {
  userId: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  medicalHistory: string;
}

export interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export interface RazorpayOrderCreateRequestBody {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture?: number;
}
