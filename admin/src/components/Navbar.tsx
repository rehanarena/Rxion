import { useContext } from 'react';
import logo from '../assets/admin_logo.png';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext)!;

  const navigate = useNavigate();

  const logout = () => {
    navigate('/');
    if (aToken) {
      setAToken('');
      localStorage.removeItem('aToken');
    }
  };

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img className='w-24 cursor-pointer' src={logo} alt="" /> {/* Adjusted width */}
        <p className='border px-2.5 py-0.5 rounded-full border-gray-600'>
          {aToken ? 'Admin' : 'Doctor'}
        </p>
      </div>
      <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
