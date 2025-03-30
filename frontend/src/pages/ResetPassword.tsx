import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const ResetPassword = () => {
  const { state } = useLocation();
  const backendUrl =
    import.meta.env.VITE_NODE_ENV === "PRODUCTION"
      ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
      : import.meta.env.VITE_BACKEND_URL;

  // Destructure userId, email, and token from state
  const { userId, email, token } = state || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Validate that necessary info is present, otherwise redirect to login
    if (!userId || !email || !token) {
      toast.error("Invalid access! Redirecting to login.");
      navigate("/login");
    }
  }, [userId, email, token, navigate]);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.put(`${backendUrl}/api/user/reset-password`, {
        email,
        token,
        password: newPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully.", {
          onClose: () => navigate("/login"),
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
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
      <form onSubmit={handlePasswordReset} className="flex flex-col gap-3 w-80">
        <label className="flex flex-col">
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border p-2 rounded"
          />
        </label>
        <button type="submit" className="bg-primary text-white py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
