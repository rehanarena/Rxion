import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AppContextType {
  backendUrl: string;
  token: string | false;
}
const Wallet = () => {
  const {backendUrl, token} =useContext(AppContext) as AppContextType;
  const [balance, setBalance] = useState<number>(0);

  const fetchWalletBalance = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/wallet', {
        headers: { token },
      });
      if (data.success) {
        setBalance(data.walletBalance);
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message || 'An error occurred while fetching wallet balance');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchWalletBalance();
    }
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Wallet</h2>
      <p className="text-lg">Current Balance: ₹{balance}</p>
      {/* You can add additional functionality here (e.g. add funds) */}
    </div>
  );
};

export default Wallet;
