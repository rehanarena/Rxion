

import React, { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { useSearchParams } from "react-router-dom"
import { Send, Loader2 } from "lucide-react"

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
}

const DoctorChatComponent: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Room and doctor (sender) info from URL
  const room = searchParams.get("room") || "defaultRoom";
  const sender = searchParams.get("sender") || "Doctor";

  // Retrieve patient details from URL query parameters
  const patientName = searchParams.get("patientName") || "Patient";
  const patientImage = searchParams.get("patientImage") || "/default-user.png";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typingMessage, setTypingMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to socket server when component mounts
  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join the room and set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-chat", room);

    socket.on("chat-history", (history: ChatMessage[]) => {
      setMessages(history);
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

    return () => {
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [socket, room]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const sendMessage = () => {
    if (input.trim() !== "") {
      const messageData: ChatMessage = {
        sender,
        message: input,
        timestamp: new Date().toISOString(),
      };
      socket?.emit("send-message", { room, ...messageData });
      setInput("");
      socket?.emit("stop-typing", { room, sender });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <div className="flex flex-col w-full h-full">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex items-center gap-3">
          {/* Patient Profile Image */}
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <img
              src={patientImage}
              alt={patientName}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Chat with {patientName}</h2>
            <p className="text-xs">Connected as {sender}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === sender ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start max-w-[80%]">
                {msg.sender !== sender && (
                  <div className="h-10 w-10 mr-3 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                    {getInitials(msg.sender)}
                  </div>
                )}
                <div>
                  <div
                    className={`rounded-lg p-3 shadow-md ${
                      msg.sender === sender
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {msg.sender === sender && (
                  <div className="h-10 w-10 ml-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {getInitials(msg.sender)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typingMessage && (
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {typingMessage}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex w-full items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={input.trim() === ""}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorChatComponent;
