import { useContext } from 'react';
import logo from '../assets/admin_logo.png';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';

const Navbar = (): JSX.Element => {
  const { aToken, setAToken } = useContext(AdminContext) ?? {};
  const { dToken, setDToken } = useContext(DoctorContext) ?? {};

  const navigate = useNavigate();

  const logout = (): void => {
    navigate('/');
    if (aToken && setAToken) {
      setAToken("");
      localStorage.removeItem("aToken");
    }
    if (dToken && setDToken) {
      setDToken("");
      localStorage.removeItem("dToken");
    }
  };

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img className='w-24 cursor-pointer' src={logo} alt="Logo" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-600'>
          {aToken ? 'Admin' : dToken ? 'Doctor' : 'Guest'}
        </p>
      </div>
      <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
