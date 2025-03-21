import { useContext } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from '../src/pages/Admin/Dashboard';
import AllAppoinments from './pages/Admin/AllAppoinments';
import AddDoctor from './pages/Admin/AddDoctor';
import AddSpeciality from './pages/Admin/AddSpeciality';
import Speciality from './pages/Admin/Speciality'
import DoctorList from './pages/Admin/DoctorList';
import UserList from './pages/Admin/UserList';
import AllDoctors from './pages/Admin/AllDoctors';
import DoctorDetails from './pages/Admin/DoctorDeatils';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppoinments from './pages/Doctor/DoctorAppoinments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import SlotManagement from './pages/Doctor/SlotManagement';
import AddSlots from './pages/Doctor/AddSlots';
import NotFound from './components/NotFound';
import DoctorForgotPasswordOTP from './pages/DoctorForgotPassword';
import DoctorResetPasswordOTP from './pages/DoctorResetPassword';
import VerifyOtp from './pages/verifyOtp';
import DoctorVideoCallPage from './pages/Doctor/DoctorVideoCallPage';
import DoctorChat from './pages/Doctor/chat';
import PatientList from './pages/Doctor/PatientchatList';


interface AdminContextType {
  aToken: string | null;
}

interface DoctorContextType {
  dToken: string | null;
}

const App = () => {
  const { aToken } = useContext(AdminContext) as AdminContextType;
  const { dToken } = useContext(DoctorContext) as DoctorContextType;

  return (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      {(aToken || dToken) ? (
        <>
          <Navbar />
          <div className='flex items-start'>
            <Sidebar />
            <Routes>
              {/* Admin Routes */}
              <Route path='/' element={<Dashboard />} />
              <Route path='/admin-dashboard' element={<Dashboard />} />
              <Route path='/all-appoinments' element={<AllAppoinments />} />
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/add-speciality' element={<AddSpeciality />} />
              <Route path='/speciality' element={<Speciality />} />
              <Route path='/doctor-list' element={<DoctorList />} />
              <Route path='/all-doctors' element={<AllDoctors />} />
              <Route path='/doctor-details/:doctorId' element={<DoctorDetails />} />
              <Route path='/user-list' element={<UserList />} />
              
              {/* Doctor Routes */}
              <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor-appoinments' element={<DoctorAppoinments />} />
              <Route path="/doctor/video-call/:appointmentId" element={<DoctorVideoCallPage />} />
              <Route path="/doctor-patient-list" element={< PatientList/>} />
              <Route path="/doctor-chat" element={< DoctorChat/>} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
              <Route path='/doctor-slots' element={<AddSlots />} />
              <Route path='/doctor-slot-manage' element={<SlotManagement />} />
              
              {/* Fallback for unknown routes */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </div>
        </>
      ) : (
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={< VerifyOtp/>} />
          <Route path="/doctor/forgot-password-otp" element={<DoctorForgotPasswordOTP />} />
          <Route path="/doctor/reset-password-otp" element={<DoctorResetPasswordOTP />} />
          {/* Fallback route: any unknown URL redirects to Login */}
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
