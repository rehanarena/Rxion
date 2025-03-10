"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
}

// Use optional chaining (or a fallback) to prevent null reference errors.
const ChatComponent: React.FC = () => {
  const searchParams = useSearchParams();
  const room = searchParams?.get('room') || 'defaultRoom';
  const sender = searchParams?.get('sender') || 'anonymous';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typingMessage, setTypingMessage] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-chat', room);

    socket.on('chat-history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('receive-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('typing', ({ sender: typingSender }: { sender: string }) => {
      setTypingMessage(`${typingSender} is typing...`);
    });

    socket.on('stop-typing', () => {
      setTypingMessage('');
    });

    return () => {
      socket.off('chat-history');
      socket.off('receive-message');
      socket.off('typing');
      socket.off('stop-typing');
    };
  }, [socket, room]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socket?.emit('typing', { room, sender });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop-typing', { room, sender });
    }, 1000);
  };

  const sendMessage = () => {
    if (input.trim() !== '') {
      socket?.emit('send-message', { room, message: input, sender });
      setInput('');
      socket?.emit('stop-typing', { room, sender });
    }
  };

  return (
    <div className="chat-container" style={{ border: "1px solid #ccc", padding: "1rem", width: "100%", maxWidth: "600px" }}>
      <div className="chat-history" style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "0.5rem" }}>
            <strong>{msg.sender}: </strong>
            <span>{msg.message}</span>
            <br />
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <div className="typing-indicator" style={{ height: "1.5rem", marginBottom: "0.5rem", color: "gray" }}>
        {typingMessage}
      </div>
      <div className="chat-input" style={{ display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{ flexGrow: 1, padding: "0.5rem" }}
        />
        <button onClick={sendMessage} style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
