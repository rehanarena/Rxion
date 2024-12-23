import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext"; 

const ForgotPassword = () => {
  const context = useContext(AppContext);
  const backendUrl = context?.backendUrl;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!backendUrl) {
      setError("Backend URL is unavailable.");
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setError(null);
        
        const { userId } = response.data; 

        setTimeout(() => {
          if (userId) {
            navigate("/verify-otp", { state: { userId } });
          } else {
            setError("User ID not found. Please try again.");
          }
        }, 3000);
      } else {
        setError(response.data.message);
        setSuccess(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
      setSuccess(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Send OTP
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-500">{success}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
