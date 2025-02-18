import { useContext } from 'react';
import Login from './pages/Login';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../src/pages/Admin/Dashboard';
import AllAppoinments from './pages/Admin/AllAppoinments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorList from './pages/Admin/DoctorList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppoinments from './pages/Doctor/DoctorAppoinments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import UserList from './pages/Admin/UserList';
import AllDoctors from './pages/Admin/AllDoctors';
import SlotManagement from './pages/Doctor/slotManagement'
import AddSlots from './pages/Doctor/AddSlots'
import NotFound from './components/NotFound';

interface AdminContextType {
  aToken: string | null;
}

interface DoctorContextType {
  dToken: string | null;
}

const App = () => {
  const { aToken } = useContext(AdminContext) as AdminContextType;
  const{ dToken} = useContext(DoctorContext) as DoctorContextType;

  return aToken || dToken? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          {/* * Admin Route * */}
          <Route path='/' element={<></>} />
          <Route path='*' element={<NotFound />} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appoinments' element={<AllAppoinments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorList />} />
          <Route path='/all-doctors' element={<AllDoctors />} />
          <Route path='/user-list' element={<UserList />} />

          {/* * Doctor Route * */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appoinments' element={<DoctorAppoinments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-slots' element={<AddSlots />} />
          <Route path='/doctor-slot-manage' element={<SlotManagement />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
}

export default App;
