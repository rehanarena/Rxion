import { useContext, useEffect, useState } from "react"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"
import { WalletIcon, RefreshCw } from "lucide-react"

interface AppContextType {
  backendUrl: string
  token: string | false
}

const Wallet = () => {
  const { backendUrl, token } = useContext(AppContext) as AppContextType
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchWalletBalance = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const { data } = await axios.get(backendUrl + "/api/user/wallet", {
        headers: { token },
      })
      if (data.success) {
        setBalance(data.walletBalance)
      } else {
        toast.error(data.message)
      }
    } catch (error: unknown) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred while fetching wallet balance")
      } else {
        toast.error("An unexpected error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchWalletBalance()
    }
  }, [token])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <WalletIcon className="mr-2 h-6 w-6 text-blue-500" />
          My Wallet
        </h2>
        <button
          onClick={fetchWalletBalance}
          disabled={isLoading}
          className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
          aria-label="Refresh balance"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Current Balance</p>
        <p className="text-3xl font-bold text-gray-800">₹{balance.toLocaleString()}</p>
      </div>
    </div>
  )
}

export default Wallet
