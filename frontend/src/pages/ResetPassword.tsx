import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";

interface AppContextType {
  backendUrl: string;
  token: string | null;
  setToken: (token: string) => void;
}

const ResetPassword = () => {
  const { state } = useLocation();
  const { userId } = state || {};
  const { backendUrl } = useContext(AppContext) as AppContextType;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid access! Redirecting to login.");
      navigate("/login");
    }
  }, [userId, navigate]);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      // API call to reset the password
      const response = await axios.post(`${backendUrl}/api/user/reset-password`, {
        userId,
        newPassword,
      });
      
      if (response.data.success) {
        toast.success("Password reset successfully.", {
          onClose: () => navigate("/login"), // Navigate after the toast is closed
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "An error occurred while resetting the password."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div>
      <form onSubmit={handlePasswordReset}>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
