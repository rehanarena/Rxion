"use client";

import type React from "react";
import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppContext } from "../context/AppContext";
import {
  Send,
  Loader2,
  Paperclip,
  MessageSquare,
  CheckCheck,
  Check,
  FileText,
} from "lucide-react";
import { useParams } from "react-router-dom";

interface ChatFile {
  url: string;
  type: string;
  fileName: string;
}

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  file?: ChatFile;
}
interface ChatHistoryResponse {
  patientName: string;
  patientImage: string;
  messages: ChatMessage[];
}

interface DoctorStatus {
  online: boolean;
  lastSeen?: Date;
}

const ChatComponent: React.FC = () => {
  const { userData, doctors } = useAppContext();
  const { doctorId } = useParams<{ doctorId: string }>();
  console.log("doctorId from URL:", doctorId);

  const selectedDoctor = doctors.find((doc) => doc._id === doctorId);
  const doctorName = selectedDoctor ? selectedDoctor.name : "Doctor";
  const doctorImage = selectedDoctor
    ? selectedDoctor.image
    : "/fallback-image.png";

  // Use patient's _id as the room and name as sender.
  const room = userData?._id;
  const sender = userData?.name;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typingMessage, setTypingMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // New state for doctor's online status
  const [doctorStatus, setDoctorStatus] = useState<DoctorStatus>({
    online: false,
  });

  // Connect to the socket server on mount and emit our own online status.
  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);
    if (userData?._id) {
      newSocket.emit("user-online", userData._id);
    }
    return () => {
      newSocket.disconnect();
    };
  }, [userData]);

  // Listen for user-status events (e.g. for the doctor)
  useEffect(() => {
    if (!socket) return;
    socket.on(
      "user-status",
      (data: { userId: string; online: boolean; lastSeen?: string }) => {
        console.log("Received user-status:", data);
        if (data.userId === doctorId) {
          setDoctorStatus({
            online: data.online,
            lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
          });
        }
      }
    );
    return () => {
      socket.off("user-status");
    };
  }, [socket, doctorId]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join chat room and set up listeners
  useEffect(() => {
    if (!socket || !room) return;
    socket.emit("join-chat", room);

    // Updated to expect an object with patient info and messages
    // In your useEffect where you set up socket listeners:
    socket.on("chat-history", (data: ChatHistoryResponse | ChatMessage[]) => {
      if (Array.isArray(data)) {
        // If data is already an array, use it directly.
        setMessages(data);
      } else if (data && data.messages) {
        // If data is an object, extract messages from it.
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    });

    socket.on("receive-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ sender: typingSender }: { sender: string }) => {
      setTypingMessage(`${typingSender} is typing...`);
    });

    socket.on("stop-typing", () => {
      setTypingMessage("");
    });

    // Update read receipts when the doctor marks messages as read
    socket.on("messages-read", (data: { room: string; sender: string }) => {
      if (sender && data.sender !== sender) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender === sender ? { ...msg, read: true } : msg
          )
        );
      }
    });

    return () => {
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("messages-read");
    };
  }, [socket, room, sender]);

  // Emit a read event when there are unread messages
  useEffect(() => {
    if (socket && room && messages.length > 0 && sender) {
      const unreadMessages = messages.filter(
        (msg) => msg.sender !== sender && !msg.read
      );
      if (unreadMessages.length > 0) {
        socket.emit("read-messages", { room, sender });
      }
    }
  }, [messages, socket, room, sender]);

  // Handle text input change and typing events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socket?.emit("typing", { room, sender });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop-typing", { room, sender });
    }, 1000);
  };

  // Function to send a text message
  const sendMessage = () => {
    if (input.trim() !== "" && userData) {
      socket?.emit("send-message", {
        room,
        message: input,
        sender,
        patientName: userData.name,
        patientImage: userData.image,
      });
      setInput("");
      socket?.emit("stop-typing", { room, sender });
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !room || !sender) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("room", room);

      // Make sure /api/user/upload returns { url: string }
      const response = await fetch("http://localhost:4000/api/user/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const fileUrl = data.url; // returned file URL

      socket.emit("send-message", {
        room,
        message: "",
        sender,
        patientName: userData.name,
        patientImage: userData.image,
        file: {
          url: fileUrl,
          type: file.type,
          fileName: file.name,
        },
      });
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isCurrentUser = (messageSender: string) => messageSender === sender;

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/30">
          <img
            src={doctorImage || "/placeholder.svg"}
            alt={doctorName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-semibold">{doctorName}</h2>
          <div className="flex items-center text-xs text-white/80">
            {doctorStatus.online ? (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></div>
                <span>Online</span>
              </div>
            ) : (
              <div className="text-gray-300">
                Last seen{" "}
                {doctorStatus.lastSeen
                  ? doctorStatus.lastSeen.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "not available"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <MessageSquare className="h-12 w-12 text-gray-300" />
            </div>
            <p className="font-medium text-gray-500">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                isCurrentUser(msg.sender) ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                  isCurrentUser(msg.sender)
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white border border-gray-100 rounded-bl-none"
                }`}
              >
                {/* Show the sender's name if it's not the current user */}
                {!isCurrentUser(msg.sender) && (
                  <div className="font-medium text-xs text-gray-500 mb-1">
                    {msg.sender}
                  </div>
                )}

                {/* Message text or file */}
                <div className="break-words">
                  {msg.file ? (
                    msg.file.type.startsWith("image/") ? (
                      <img
                        src={msg.file.url || "/placeholder.svg"}
                        alt="Uploaded image"
                        className="rounded-md max-w-full border border-gray-200"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-2 rounded ${
                            isCurrentUser(msg.sender)
                              ? "bg-indigo-700"
                              : "bg-gray-100"
                          }`}
                        >
                          <FileText
                            className={`h-4 w-4 ${
                              isCurrentUser(msg.sender)
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <a
                          href={msg.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm underline ${
                            isCurrentUser(msg.sender)
                              ? "text-indigo-100"
                              : "text-indigo-600"
                          }`}
                        >
                          {msg.file.fileName}
                        </a>
                      </div>
                    )
                  ) : (
                    msg.message
                  )}
                </div>

                {/* Timestamp and read receipt */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span
                    className={`text-xs ${
                      isCurrentUser(msg.sender)
                        ? "text-indigo-200"
                        : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                  {isCurrentUser(msg.sender) && (
                    <span className="ml-1">
                      {msg.read ? (
                        <CheckCheck className="h-3 w-3 text-green-400" />
                      ) : (
                        <Check className="h-3 w-3 text-indigo-200" />
                      )}
                    </span>
                  )}
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
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-1 flex-1">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${doctorName}...`}
              className="flex-1 bg-transparent py-2 outline-none text-gray-700 placeholder-gray-400"
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
              htmlFor="file-upload"
              className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full ${
                uploading ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
              ) : (
                <Paperclip className="h-5 w-5 text-gray-600" />
              )}
            </label>
            <input
              id="file-upload"
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
  );
};

export default ChatComponent;
