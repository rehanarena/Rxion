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
        
        // Assuming the backend sends a userId or related information in the response
        const { userId } = response.data; 

        setTimeout(() => {
          // Pass userId to the VerifyOtp page via navigate state
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
      // Improved error handling for axios errors
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
      setSuccess(null);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Send OTP</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default ForgotPassword;
