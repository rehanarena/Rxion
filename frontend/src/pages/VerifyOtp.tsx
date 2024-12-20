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
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60); // Countdown timer in seconds
  const [isResendActive, setIsResendActive] = useState(false);

  // Get userId and context (registration or forgot-password)
  const { state } = useLocation();
  const { userId, isForPasswordReset } = state || {}; // Added isForPasswordReset flag

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid access! Redirecting to registration.");
      navigate("/register");
    }
  }, [userId, navigate]);

  // Timer Effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval); 
    } else {
      setIsResendActive(true); 
    }
  }, [timer]);

  const verifyOtpHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be a 6-digit number.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/verify-otp`, {
        otp,
        userId,
      });
      if (data.success) {
        toast.success(data.message);
        
        if (isForPasswordReset) {
          // If it's for password reset, navigate to reset password page
          navigate("/reset-password", { state: { userId } });
        } else {
          // If it's for registration, navigate to login page
          navigate("/login");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to verify OTP.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtpHandler = async () => {
    try {
      setIsResendActive(false);
      setTimer(60); // Reset timer to 60 seconds
      const { data } = await axios.post(`${backendUrl}/api/user/resend-otp`, {
        userId,
      });
      if (data.success) {
        toast.success("OTP has been resent to your email.");
      } else {
        toast.error(data.message);
      }
    } catch  {
      toast.error("Failed to resend OTP. Please try again.");
      setIsResendActive(true); // Allow retry if the API call fails
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
              aria-label="Enter OTP"
            />
          </label>
        </div>
        <button
          type="submit"
          className={`bg-primary text-white w-full py-2 rounded-md text-base ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
        <p className="text-sm text-zinc-500 mt-2">
          {timer > 0
            ? `Resend OTP in ${timer} seconds`
            : "You can now resend the OTP."}
        </p>
        <button
          type="button"
          onClick={resendOtpHandler}
          className={`text-primary mt-2 text-base ${
            isResendActive ? "" : "opacity-50 cursor-not-allowed"
          }`}
          disabled={!isResendActive}
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
};

export default VerifyOtp;
