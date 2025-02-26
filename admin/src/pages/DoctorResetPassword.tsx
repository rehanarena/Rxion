// DoctorResetPassword.tsx
import { useState, FormEvent, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";

const DoctorResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { backendUrl } = useContext(AdminContext)!;
  const [loading, setLoading] = useState(false);

  // Use useLocation to get state passed from navigation
  const { state } = useLocation();
  const { email, token } = state || {};

  useEffect(() => {
    console.log("Debug: Reset state parameters:", { email, token });
  }, [email, token]);

  const onSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!email || !token) {
      toast.error("Invalid or expired password reset link.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/resetPasswordWithToken`,
        { email, token, password }
      );
      if (data.success) {
        toast.success("Password updated successfully.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 border rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <div className="w-full">
          <label className="block mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="w-full">
          <label className="block mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white rounded px-4 py-2 w-full"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
};

export default DoctorResetPassword;
