import { useContext, useState, FormEvent } from "react";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";

const Login: React.FC = () => {
  const { setAToken, backendUrl } = useContext(AdminContext); // Correctly typed context
  const [state, setState] = useState<"Admin" | "Doctor">("Admin");
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onSubmitHandler = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      if (state === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        });
        if (data.success) {
          console.log("Token:", data.token);
          setAToken(data.token);
        }
      } else {
        console.log("Doctor login is not implemented yet.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
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
        <button className="bg-primary text-white w-full py-2 rounded-md text-base">
          Login
        </button>
        {state === "Admin" ? (
          <p>
            Doctor Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Doctor")}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Admin")}
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
