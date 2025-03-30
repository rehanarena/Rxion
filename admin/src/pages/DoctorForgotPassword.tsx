import { useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


const DoctorForgotPasswordOTP = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const  backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"? import.meta.env.VITE_PRODUCTION_URL_BACKEND: import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate();

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/forgotPasswordOTP`,
        { email }
      );
      if (data.success) {
        toast.success("OTP sent to your email.");
        navigate("/verify-otp", {
          state: { doctorId: data.doctorId, isForPasswordReset: true, userType: "doctor" },
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 border rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold">Doctor Forgot Password</h2>
        <div className="w-full">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="bg-primary text-white rounded px-4 py-2 w-full"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default DoctorForgotPasswordOTP;
