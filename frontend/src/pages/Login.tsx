import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import  {auth } from '../../firebase/firebaseConfig';


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

  const onSubmitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
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
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          setToken(data.accessToken);
          navigate("/", { replace: true });
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
      navigate("/", { replace: true }); 
    }
  }, [setToken, navigate]);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) return;

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(
              `${backendUrl}/api/user/refresh-token`,
              {
                refreshToken,
              }
            );

            const { accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            setToken(accessToken);

            originalRequest.headers["Authorization"] = "Bearer " + accessToken;
            return axios(originalRequest);
          } catch {
            navigate("/login");
            toast.error("Session expired. Please log in again.");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [setToken, backendUrl, navigate]);

  const handleGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const { data } = await axios.post(`${backendUrl}/api/user/google`, {
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      });
      
  
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
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign Up" ? "sign up" : "login"} to book an
          appointment.
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
                type="text"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </label>
          </div>
        )}
        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base"
        >
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
        <button onClick={handleGoogle}
          type="button"
          className="w-full py-2 mt-3 rounded-md text-base border border-gray-300 flex items-center justify-center gap-3 text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="24"
            height="24"
            className="text-gray-700"
          >
            <path
              fill="#4285F4"
              d="M23.49 12.3c0-.73-.06-1.43-.18-2.1H12v4.1h6.18c-0.26 1.44-1.02 2.66-2.14 3.29v2.74h3.44c2.02-1.87 3.18-4.66 3.18-8.03z"
            />
            <path
              fill="#34A853"
              d="M12 6.2c1.12 0 2.08.38 2.83 1.02L16.96 4.02C15.39 2.57 13.22 1.5 11 1.5 7.25 1.5 4.12 3.35 3.03 6.3l3.81 2.92C7.65 7.61 9.23 6.2 12 6.2z"
            />
            <path
              fill="#FBBC05"
              d="M3.03 6.3C4.12 3.35 7.25 1.5 11 1.5c2.22 0 4.39 1.07 5.96 2.52l2.83-2.93C15.22 2.57 13.39 1.5 12 1.5c-2.22 0-4.25 1.07-5.25 2.8l-3.81-2.92z"
            />
            <path
              fill="#EA4335"
              d="M7.65 7.61C8.4 6.39 9.62 5.5 11 5.5c1.63 0 3.08.83 3.88 2.02L16.96 4.02C15.39 2.57 13.22 1.5 11 1.5c-2.22 0-4.25 1.07-5.25 2.8L7.65 7.61z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>
    </form>
  );
};

export default Login;
