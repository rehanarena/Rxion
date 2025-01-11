import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface AppContextType {
  backendUrl: string;
  token: string | null;
  setToken: (token: string) => void;
}

const Login = () => {
  const { backendUrl, setToken } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();

  const [state, setState] = useState<"Sign Up" | "Login">("Sign Up");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      if (state === "Sign Up") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          password,
          email,
          confirmPassword,
        });

        if (data.success) {
          toast.success(data.message);
          navigate("/verify-otp", { state: { userId: data.userId } });
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          password,
          email,
        });

        if (data.success) {
          if (data.user?.isBlocked) {
            toast.error("Your account has been blocked by the admin.");
            return;
          }
          localStorage.setItem("accessToken", data.accessToken); // Store access token
          localStorage.setItem("refreshToken", data.refreshToken); // Store refresh token
          setToken(data.accessToken);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Check token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      navigate("/login");
    }
  }, [setToken, navigate]);

  // Axios Interceptor for Token Refresh
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!refreshToken) return;

    const interceptor = axios.interceptors.response.use(
      (response) => response, // pass through successful responses
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(`${backendUrl}/api/user/refresh-token`, {
              refreshToken,
            });

            const { accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            setToken(accessToken);

            originalRequest.headers["Authorization"] = "Bearer " + accessToken;
            return axios(originalRequest); // retry original request with new token
          } catch  {
            // If the refresh fails, logout the user
            navigate("/login");
            toast.error("Session expired. Please log in again.");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor); // Clean up interceptor on component unmount
    };
  }, [setToken, backendUrl, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign Up" ? "sign up" : "login"} to book an appointment.
        </p>
        {state === "Sign Up" && (
          <div className="w-full">
            <label className="block">
              Full Name
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </label>
          </div>
        )}
        <div className="w-full">
          <label className="block">
            Email
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </label>
        </div>
        <div className="w-full">
          <label className="block">
            Password
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </label>
        </div>
        {state === "Sign Up" && (
          <div className="w-full">
            <label className="block">
              Confirm Password
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </label>
          </div>
        )}
        <button type="submit" className="bg-primary text-white w-full py-2 rounded-md text-base">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>
        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-primary underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}
        {state === "Login" && (
          <p>
            Forgot your password?{" "}
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
