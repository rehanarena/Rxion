import { useContext, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; 
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; 

const Login = () => {
  const [state, setState] = useState<"Admin" | "Doctor">("Admin");
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { setAToken, backendUrl } = useContext(AdminContext)!;
  const { setDToken } = useContext(DoctorContext)!;
  const navigate = useNavigate();

  const onSubmitHandler = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return; 
    setLoading(true);
    try {
      if (state === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, { email, password });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success('Admin logged in successfully');
          navigate("/admin-dashboard");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, { email, password });
        if (data.success) {
          if (data.doctor?.isBlocked) {
            toast.error("Your account has been blocked by the admin.");
            return;
          }
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success('Doctor logged in successfully');
          navigate("/doctor-dashboard");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[-340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
          />
        </div>
        
        {state === "Doctor" && (
          <div className="w-full text-right">
            <Link to="/doctor/forgot-password-otp" className="text-primary underline text-sm">
              Forgot Password?
            </Link>
          </div>
        )}
        <button disabled={loading} className="bg-primary text-white w-full py-2 rounded-md text-base"
         type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>

        {state === "Admin" ? (
          <>
            <p>
              Doctor Login?{" "}
              <span
                className="text-primary underline cursor-pointer"
                onClick={() => setState("Doctor")}
              >
                Click here
              </span>
            </p>
          </>
        ) : (
          <>
            <p>
              Admin Login?{" "}
              <span
                className="text-primary underline cursor-pointer"
                onClick={() => setState("Admin")}
              >
                Click here
              </span>
            </p>
          </>
        )}
      </div>
    </form>
  );
};

export default Login;
