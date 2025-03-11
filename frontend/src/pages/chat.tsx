"use client"

import React, { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { useAppContext } from "../context/AppContext"
import { Send, Loader2 } from "lucide-react"
import { useParams } from "react-router-dom"

interface ChatMessage {
  sender: string
  message: string
  timestamp: Date
}

const ChatComponent: React.FC = () => {
  // Access global context (user info and doctors list)
  const { userData, doctors } = useAppContext()

  const { doctorId } = useParams<{ doctorId: string }>()
  console.log("doctorId from URL:", doctorId) // Should now print the actual ID

  // Find the selected doctor and retrieve both name and image
  const selectedDoctor = doctors.find((doc) => doc._id === doctorId)
  const doctorName = selectedDoctor ? selectedDoctor.name : "Doctor"
  const doctorImage = selectedDoctor ? selectedDoctor.image : "/fallback-image.png"

  console.log(doctorName)
  // Use userData._id for the unique room
  const room = userData?._id
  const sender = userData?.name

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [typingMessage, setTypingMessage] = useState("")
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Connect to socket server when component mounts
  useEffect(() => {
    const newSocket = io("http://localhost:4000")
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Join the room and set up socket listeners
  useEffect(() => {
    if (!socket || !room) return

    socket.emit("join-chat", room)

    socket.on("chat-history", (history: ChatMessage[]) => {
      setMessages(history)
    })

    socket.on("receive-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on("typing", ({ sender: typingSender }: { sender: string }) => {
      setTypingMessage(`${typingSender} is typing...`)
    })

    socket.on("stop-typing", () => {
      setTypingMessage("")
    })

    // Cleanup listeners on unmount
    return () => {
      socket.off("chat-history")
      socket.off("receive-message")
      socket.off("typing")
      socket.off("stop-typing")
    }
  }, [socket, room])

  // Handle user input and typing events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    socket?.emit("typing", { room, sender })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop-typing", { room, sender })
    }, 1000)
  }

  // Send message – UPDATED to include patientName and patientImage
  const sendMessage = () => {
    if (input.trim() !== "" && userData) {
      socket?.emit("send-message", {
        room,
        message: input,
        sender,
        patientName: userData.name,       // Include patient's name
        patientImage: userData.image,     // Include patient's image URL
      })
      setInput("")
      socket?.emit("stop-typing", { room, sender })
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  // Format timestamp for display
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if message is from current user
  const isCurrentUser = (messageSender: string) => messageSender === sender

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center gap-3">
        {/* Doctor Image */}
        <div className="h-10 w-10 rounded-full overflow-hidden">
          <img
            src={doctorImage}
            alt={doctorName}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-white font-semibold">{doctorName}</h2>
          <p className="text-xs text-white/80">Connected as {sender || "Guest"}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg
              className="h-16 w-16 mb-2 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.06 19.75 7.74 19.28L3 20L4.5 16.28C3.55 15.03 3 13.57 3 12C3 7.58 7.03 4 12 4C16.97 4 21 7.58 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`mb-4 flex ${isCurrentUser(msg.sender) ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  isCurrentUser(msg.sender)
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                {!isCurrentUser(msg.sender) && (
                  <div className="font-medium text-xs text-gray-500 mb-1">{msg.sender}</div>
                )}
                <div className="break-words">{msg.message}</div>
                <div className={`text-xs mt-1 ${isCurrentUser(msg.sender) ? "text-blue-100" : "text-gray-400"}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <div className="h-6 px-4 text-xs text-gray-500">
        {typingMessage && (
          <div className="flex items-center">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            {typingMessage}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-1">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-2 outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={input.trim() === ""}
            className={`ml-2 p-2 rounded-full ${
              input.trim() === ""
                ? "text-gray-400 cursor-not-allowed"
                : "text-white bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatComponent
