import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


interface AppContextType {
  backendUrl: string;
  token: string | null;
  setToken: (token: string) => void;
}
const VerifyOtp = () => {
   const { backendUrl } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get the userId passed from the registration page
  const { state } = useLocation();

  useEffect(() => {
    console.log('State:', state); // Debugging log
    if (state && state.userId) {
      setUserId(state.userId);
    } else {
      console.error("userId not passed to VerifyOtp component.");
    }
  }, [state]);
  

  const verifyOtpHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Entered OTP: ", otp); // Log OTP for debugging
    console.log('User ID:', userId);
  
    try {
      const { data } = await axios.post(backendUrl + "/api/user/verify-otp", {
        otp,
        userId,
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/login");  // Redirect to login page after successful verification
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  

  return (
    <form onSubmit={verifyOtpHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Verify OTP</p>
        <p>Enter the OTP sent to your email.</p>
        <div className="w-full">
          <label className="block">
            OTP
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              required
            />
          </label>
        </div>
        <button type="submit" className="bg-primary text-white w-full py-2 rounded-md text-base">
          Verify OTP
        </button>
      </div>
    </form>
  );
};

export default VerifyOtp;

