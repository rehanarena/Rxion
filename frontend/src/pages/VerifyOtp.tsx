import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyOtp = () => {
  const backendUrl =
    import.meta.env.VITE_NODE_ENV === "PRODUCTION"
      ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
      : import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [otpArray, setOtpArray] = useState(Array(6).fill("")); 
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);

  const location = useLocation();
  const stateUserId = location.state?.userId;
  const userId = stateUserId || localStorage.getItem("userId");
  const isForPasswordReset = location.state?.isForPasswordReset ;

  console.log("OTP Verification - userId:", userId);

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid access! Redirecting to registration.");
      navigate("/register");
    }
  }, [userId, navigate]);

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

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; 

    const updatedOtpArray = [...otpArray];
    updatedOtpArray[index] = value;
    setOtpArray(updatedOtpArray);

    if (value && index < otpArray.length - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otpArray[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const verifyOtpHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otp = otpArray.join("");
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
      console.log("OTP verification response:", data);
      if (data.success) {
        toast.success(data.message);
        if (isForPasswordReset) {
          const { email, token } = data;
          navigate("/reset-password", { state: { userId, email, token } });
        } else {
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
      setTimer(30);
      const { data } = await axios.post(`${backendUrl}/api/user/resend-otp`, {
        userId,
      });
      if (data.success) {
        toast.success("OTP has been resent to your email.");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
      setIsResendActive(true);
    }
  };

  return (
    <form onSubmit={verifyOtpHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Verify OTP</p>
        <p>Enter the OTP sent to your email.</p>
        <div className="flex gap-2 w-full">
          {otpArray.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="border border-zinc-300 rounded w-12 p-2 text-center"
              required
            />
          ))}
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
