import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { getAxiosInstance } from "../utils/axiosInterceptor";
import axios from "axios";

interface AppContextType {
  backendUrl: string;
  token: string | null;
  setToken: (token: string) => void;
}

const Login = () => {
  const { backendUrl, setToken } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();
  const axiosInstance = getAxiosInstance(navigate);

  const [state, setState] = useState<"Sign Up" | "Login">("Sign Up");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      if (state === "Sign Up") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }
        const { data } = await axiosInstance.post(
          `${backendUrl}/api/user/register`,
          { name, password, email, confirmPassword }
        );
  
        if (data.success) {
          toast.success(data.message);
          navigate("/verify-otp", { state: { userId: data.userId } });
        } else {
          
          toast.error(data.message);
        }
      } else {
       
        const { data } = await axiosInstance.post(
          `${backendUrl}/api/user/login`,
          { password, email }
        );
  
        if (data.success) {
          if (data.user?.isBlocked) {
            toast.error("Your account has been blocked by the admin.");
            return;
          }
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          setToken(data.accessToken);
          navigate("/", { replace: true });
        } else {
          toast.error(data.message);
        }
      }
    }  catch (error: unknown) {
      let errorMessage = "Something went wrong";
  
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      toast.error(errorMessage);
    }
  };
  

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
      navigate("/", { replace: true });
    }
  }, [setToken, navigate]);

  const handleGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { data } = await axiosInstance.post(
        `${backendUrl}/api/user/google`,
        {
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }
      );
      if (data.success) {
        if (data.user?.isBlocked) {
          toast.error("Your account has been blocked by the admin.");
          return;
        }
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken);
        toast.success(data.message);
        navigate("/", { replace: true });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700 px-4">
      {/* Main container */}
      <div className="bg-white w-full max-w-4xl rounded-md shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side (Form) */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {state === "Sign Up" ? "Create Account" : "Sign In"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {state === "Sign Up"
              ? "Please fill in your details to create an account."
              : "Please sign in to continue."}
          </p>

          {/* The same form logic */}
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
            {state === "Sign Up" && (
              <div>
                <label className="block text-gray-600 text-sm mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-600 text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>

            {state === "Sign Up" && (
              <div>
                <label className="block text-gray-600 text-sm mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  required
                />
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {state === "Sign Up" ? "Sign Up" : "Login"}
            </button>

            {/* Forgot password link (only shows on Login) */}
            {state === "Login" && (
              <div className="text-sm text-center mt-2">
                Forgot your password?{" "}
                <span
                  onClick={() => navigate("/forgot-password")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Click here
                </span>
              </div>
            )}
          </form>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            type="button"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="20"
              height="20"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.94 0 6.57 1.69 8.09 3.11l5.91-5.91C34.09 3.97 29.62 2 24 2 14.86 2 7.15 7.04 3.06 14.02l6.95 5.39C11.39 14.08 17.16 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24c0-1.61-.14-3.17-.4-4.68H24v9.18h12.7c-.55 2.98-2.17 5.51-4.61 7.2l7.31 5.67C43.69 36.62 46.5 30.8 46.5 24z"
              />
              <path
                fill="#FBBC05"
                d="M10.01 28.61A14.48 14.48 0 0 1 9 24c0-1.61.26-3.17.74-4.61l-6.95-5.39A22.998 22.998 0 0 0 2 24c0 3.83.9 7.45 2.49 10.61l6.95-6z"
              />
              <path
                fill="#34A853"
                d="M24 46c6.21 0 11.43-2.05 15.24-5.56l-7.31-5.67c-2.04 1.4-4.67 2.23-7.93 2.23-6.84 0-12.61-4.58-14.66-10.89l-6.95 5.39C7.15 40.96 14.86 46 24 46z"
              />
              <path fill="none" d="M2 2h44v44H2z" />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Right Side (Overlay / Info) */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-blue-600 text-white p-8">
          {state === "Sign Up" ? (
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Welcome Back!</h2>
              <p className="text-sm text-white/90">
                Enter your personal info to sign in and start your journey
              </p>
              <button
                onClick={() => setState("Login")}
                className="mt-4 border border-white px-5 py-2 rounded hover:bg-white hover:text-blue-600 transition-colors text-sm"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Hello, Friend!</h2>
              <p className="text-sm text-white/90">
                New here? Enter your details to create an account with us
              </p>
              <button
                onClick={() => setState("Sign Up")}
                className="mt-4 border border-white px-5 py-2 rounded hover:bg-white hover:text-blue-600 transition-colors text-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
