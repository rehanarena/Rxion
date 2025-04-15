import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import Appointment from "./pages/Appoinment";
import ChatMessage from "./pages/chat";
import MyAppointments from "./pages/MyAppoinments";
import Wallet from "./pages/MyWallet";
import Navbar from "./components/Navbar";
import OtpVerify from "./pages/VerifyOtp";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./components/NotFound";
import { useAppContext } from "./context/AppContext";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PatientVideoCallPage from "./pages/PatientVideoCallPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const { token, loadUserProfileData } = useAppContext();

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    }
  }, [token, loadUserProfileData]);

  return (
    <div className="mx-4 sm:mx-[10%]">
      <ToastContainer />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Routes */}
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
        <Route path="/chat/:doctorId" element={<ChatMessage />} />
        <Route path="/patient/video-call/:appointmentId" element={
          <ProtectedRoute>
            <PatientVideoCallPage />
          </ProtectedRoute>
        } />
        <Route path="/my-wallet" element={<Wallet />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
