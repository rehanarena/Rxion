"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useNavigate } from "react-router-dom"
import { MessageSquare, Search, Inbox, Clock, ChevronRight } from "lucide-react"

interface MessageSummary {
  patientId: string
  patientName: string
  patientImage: string
  lastMessage: string
  timestamp: Date
}

interface ChatHistoryMessage {
  room: string
  patientName: string
  patientImage: string
  message: string
  timestamp: string
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
      }))
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
        patientName,
      )}&patientImage=${encodeURIComponent(patientImage)}`,
    )
  }

  const filteredMessages = messageSummaries.filter(
    (msg) =>
      msg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-full">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Patient Messages</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search patients or messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Message List */}
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Inbox className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-1">No messages yet</h3>
                <p className="text-sm text-slate-500 max-w-md">
                  When patients send you messages, they will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <li
                    key={msg.patientId}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handlePatientClick(msg.patientId, msg.patientName, msg.patientImage)}
                  >
                    <div className="flex items-center p-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={msg.patientImage || "/placeholder.svg"}
                          alt={msg.patientName}
                          className="h-12 w-12 rounded-full object-cover border border-slate-200"
                        />
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-slate-900 truncate">{msg.patientName}</h3>
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 truncate">{msg.lastMessage}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DoctorMessages

