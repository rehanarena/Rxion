"use client"

import type React from "react"
import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { io, type Socket } from "socket.io-client"
import { useSearchParams } from "react-router-dom"
import { Send, Loader2, Paperclip, MessageSquare, CheckCheck, Check, ImageIcon, FileText, User } from "lucide-react"

interface ChatFile {
  url: string
  type: string
  fileName: string
}

export interface ChatMessage {
  sender: string
  message: string
  timestamp: string // ISO string
  read?: boolean
  file?: ChatFile
}

interface PatientStatus {
  online: boolean
  lastSeen?: Date
}

const DoctorChatComponent: React.FC = () => {
  const [searchParams] = useSearchParams()
  const room = searchParams.get("room") || "defaultRoom"
  const sender = searchParams.get("sender") || "Doctor"

  // Retrieve patient details from URL query parameters
  const patientName = searchParams.get("patientName") || "Patient"
  const patientImage = searchParams.get("patientImage") || "/default-user.png"

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [typingMessage, setTypingMessage] = useState("")
  const [uploading, setUploading] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // New state for patient's status
  const [patientStatus, setPatientStatus] = useState<PatientStatus>({ online: false })

  // Connect to socket server on mount and emit our online status (as doctor)
  useEffect(() => {
    const newSocket = io("http://localhost:4000")
    setSocket(newSocket)
    // Optionally, doctor can also emit online status if needed:
    newSocket.emit("user-online", sender)
    return () => {
      newSocket.disconnect()
    }
  }, [sender])

  // Listen for user-status events (for the patient)
  useEffect(() => {
    if (!socket) return
    socket.on(
      "user-status",
      (data: { userId: string; online: boolean; lastSeen?: string }) => {
        if (data.userId === room) {
          setPatientStatus({
            online: data.online,
            lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
          })
        }
      }
    )
    return () => {
      socket.off("user-status")
    }
  }, [socket, room])

  // Join chat room and set up socket listeners
  useEffect(() => {
    if (!socket) return
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

    // Update messages when the patient marks them as read
    socket.on("messages-read", (data: { room: string; sender: string }) => {
      if (data.sender !== sender) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender === sender ? { ...msg, read: true } : msg
          )
        )
      }
    })

    return () => {
      socket.off("chat-history")
      socket.off("receive-message")
      socket.off("typing")
      socket.off("stop-typing")
      socket.off("messages-read")
    }
  }, [socket, room, sender])

  // Emit a read event when there are unread messages from the patient
  useEffect(() => {
    if (socket && room && messages.length > 0 && sender) {
      const unreadMessages = messages.filter((msg) => msg.sender !== sender && !msg.read)
      if (unreadMessages.length > 0) {
        socket.emit("read-messages", { room, sender })
      }
    }
  }, [messages, socket, room, sender])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle text input changes and typing events
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

  // Send text message
  const sendMessage = () => {
    if (input.trim() !== "") {
      const messageData: ChatMessage = {
        sender,
        message: input,
        timestamp: new Date().toISOString(),
      }
      socket?.emit("send-message", { room, ...messageData })
      setInput("")
      socket?.emit("stop-typing", { room, sender })
    }
  }

  // Handle file selection and upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !socket || !room || !sender) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("room", room)

      // Assume an upload endpoint exists at /api/doctor/upload returning { url: string }
      const response = await fetch("http://localhost:4000/api/doctor/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      const fileUrl = data.url

      socket.emit("send-message", {
        room,
        message: file.name,
        sender,
        file: {
          url: fileUrl,
          type: file.type,
          fileName: file.name,
        },
      })
    } catch (error) {
      console.error("File upload failed:", error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-indigo-50 to-purple-100 overflow-hidden">
      <div className="flex flex-col w-full h-full max-w-4xl mx-auto shadow-xl">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
            {patientImage ? (
              <img src={patientImage || "/placeholder.svg"} alt={patientName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-indigo-300 flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-700" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{patientName}</h2>
            <div className="flex items-center text-xs text-white/80">
              {patientStatus.online ? (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></div>
                  <span>Online</span>
                </div>
              ) : (
                <div className="text-gray-300">
                  Last seen{" "}
                  {patientStatus.lastSeen
                    ? patientStatus.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "N/A"}
                </div>
              )}
              <span className="mx-2">•</span>
              <span>Connected as {sender}</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-auto bg-white">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="bg-indigo-100 p-5 rounded-full mb-3">
                <MessageSquare className="h-12 w-12 text-indigo-400" />
              </div>
              <p className="font-medium text-gray-500">No messages yet</p>
              <p className="text-sm mt-1">Start the conversation with {patientName}</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === sender ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start max-w-[80%] gap-3">
                  {msg.sender !== sender && (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm">
                      {getInitials(msg.sender)}
                    </div>
                  )}
                  <div>
                    <div
                      className={`rounded-lg p-3 shadow-sm ${
                        msg.sender === sender
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.file ? (
                        <div>
                          {msg.file.type.startsWith("image/") ? (
                            <div className="space-y-2">
                              <div className="flex items-center text-xs mb-1">
                                <ImageIcon
                                  className={`h-3 w-3 mr-1 ${msg.sender === sender ? "text-indigo-200" : "text-gray-400"}`}
                                />
                                <span className={msg.sender === sender ? "text-indigo-200" : "text-gray-400"}>
                                  Image
                                </span>
                              </div>
                              <img
                                src={msg.file.url || "/placeholder.svg"}
                                alt={msg.file.fileName}
                                className="rounded-md max-w-full border border-gray-200"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded ${msg.sender === sender ? "bg-indigo-700" : "bg-gray-200"}`}>
                                <FileText
                                  className={`h-4 w-4 ${msg.sender === sender ? "text-white" : "text-gray-500"}`}
                                />
                              </div>
                              <a
                                href={msg.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm underline ${msg.sender === sender ? "text-indigo-100" : "text-indigo-600"}`}
                              >
                                {msg.file.fileName}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>{msg.message}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.sender === sender && (
                        <span className="flex items-center">
                          {msg.read ? (
                            <span className="flex items-center text-green-600">
                              <CheckCheck className="h-3 w-3 mr-1" />
                              Read
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-400">
                              <Check className="h-3 w-3 mr-1" />
                              Sent
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {msg.sender === sender && (
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {getInitials(msg.sender)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {typingMessage && (
            <div className="flex items-center text-sm text-gray-600 pl-2">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {typingMessage}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${patientName}...`}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={input.trim() === ""}
                className={`ml-2 p-2 rounded-full transition-colors ${
                  input.trim() === ""
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-white bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {/* File Upload Button */}
            <div>
              <label
                htmlFor="file-upload-doctor"
                className={`cursor-pointer flex items-center justify-center w-12 h-12 rounded-full ${
                  uploading ? "bg-gray-200" : "bg-indigo-100 hover:bg-indigo-200"
                } transition-colors`}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5 text-indigo-600" />
                )}
              </label>
              <input
                id="file-upload-doctor"
                type="file"
                accept="*/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorChatComponent
