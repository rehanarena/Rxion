import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import Appointment from "./pages/Appoinment";
import MyAppointments from "./pages/MyAppoinments";
import Navbar from "./components/Navbar";
import OtpVerify from './pages/VerifyOtp'
import Footer from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={< OtpVerify/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
