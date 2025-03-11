import type React from "react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useNavigate } from "react-router-dom"
import { MessageSquare, Search, Inbox } from "lucide-react"

interface MessageSummary {
  patientId: string
  patientName: string
  patientImage: string
  lastMessage: string
  timestamp: Date
}
interface ChatHistoryMessage {
  room: string;
  patientName: string;
  patientImage: string;
  message: string;
  timestamp: string;
}

const DoctorMessages: React.FC = () => {
  const [messageSummaries, setMessageSummaries] = useState<MessageSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const socket = io("http://localhost:4000")

    // Request existing chat history
    socket.emit("get-chat-history")

    socket.on("chat-history", (history: ChatHistoryMessage[]) => {
      const formattedHistory = history.map((msg: ChatHistoryMessage) => ({
        patientId: msg.room,
        patientName: msg.patientName || "Unknown",
        patientImage: msg.patientImage || "/default-user.png",
        lastMessage: msg.message,
        timestamp: new Date(msg.timestamp),
      }));
      setMessageSummaries(formattedHistory)
    })

    // Listen for new messages
    socket.on("receive-message", (msg) => {
      setMessageSummaries((prev) => {
        const existingIndex = prev.findIndex((item) => item.patientId === msg.room)

        if (existingIndex !== -1) {
          // Preserve existing name & image if they are missing
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            patientName: msg.patientName || updated[existingIndex].patientName,
            patientImage: msg.patientImage?.startsWith("http") ? msg.patientImage : updated[existingIndex].patientImage,
            lastMessage: msg.message,
            timestamp: new Date(msg.timestamp),
          }
          return updated
        } else {
          // Add new entry with proper default handling
          return [
            ...prev,
            {
              patientId: msg.room,
              patientName: msg.patientName || "Unknown",
              patientImage: msg.patientImage?.startsWith("http") ? msg.patientImage : "/default-user.png",
              lastMessage: msg.message,
              timestamp: new Date(msg.timestamp),
            },
          ]
        }
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handlePatientClick = (patientId: string, patientName: string, patientImage: string) => {
    navigate(
      `/doctor-chat?room=${patientId}&sender=doctor&patientName=${encodeURIComponent(
        patientName
      )}&patientImage=${encodeURIComponent(patientImage)}`
    )
  }

  const filteredMessages = messageSummaries.filter(
    (msg) =>
      msg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Patient Messages</h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search patients or messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Message List */}
        <div className="divide-y divide-gray-200 max-h-[calc(100vh-240px)] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="mt-2 text-base font-medium text-gray-900">
                No messages yet
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.patientId}
                className="p-4 flex items-center cursor-pointer hover:bg-gray-50"
                onClick={() => handlePatientClick(msg.patientId, msg.patientName, msg.patientImage)}
              >
                <img src={msg.patientImage} alt={msg.patientName} className="h-10 w-10 rounded-full" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{msg.patientName}</p>
                  <p className="text-xs text-gray-500">{msg.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorMessages
