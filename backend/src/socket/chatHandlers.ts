// socket/chatHandler.ts

import { Socket, Server } from 'socket.io';

interface ChatFile {
  url: string;
  type: string;
  fileName: string;
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
  read: boolean;
  file?: ChatFile; // Optional file property
}

interface ChatRoom {
  patientName: string;
  patientImage: string;
  messages: ChatMessage[];
}

const chatHistory: { [room: string]: ChatRoom } = {};

export function chatHandler(socket: Socket, io: Server) {
  socket.on('join-chat', (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined chat room ${room}`);
    if (!chatHistory[room]) {
      chatHistory[room] = { patientName: "", patientImage: "", messages: [] };
    }
    // Send existing chat messages to the client
    socket.emit('chat-history', chatHistory[room].messages);
  });
  
  socket.on('send-message', (data: { 
    room: string; 
    message: string; 
    sender: string; 
    patientName?: string; 
    patientImage?: string; 
    file?: ChatFile 
  }) => {
    const { room, message, sender, patientName, patientImage, file } = data;
    console.log("send-message received:", data);
    const msg: ChatMessage = { 
      sender, 
      message, 
      timestamp: new Date(), 
      read: false, 
      file: file ? file : undefined
    };

    // Initialize room if needed and update metadata
    if (!chatHistory[room]) {
      chatHistory[room] = {
        patientName: patientName || "",
        patientImage: patientImage || "",
        messages: []
      };
    } else {
      if (!chatHistory[room].patientName && patientName) {
        chatHistory[room].patientName = patientName;
      }
      if (!chatHistory[room].patientImage && patientImage) {
        chatHistory[room].patientImage = patientImage;
      }
    }
    chatHistory[room].messages.push(msg);
    io.to(room).emit('receive-message', msg);
  });

  // Event to mark messages as read
  socket.on('read-messages', (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    if (chatHistory[room]) {
      // Mark messages not sent by the reader as read
      chatHistory[room].messages.forEach(msg => {
        if (msg.sender !== sender && !msg.read) {
          msg.read = true;
        }
      });
      io.to(room).emit('messages-read', { room, sender });
      console.log(`Messages in room ${room} marked as read by ${sender}`);
    }
  });

  socket.on('get-chat-history', () => {
    const summary = Object.entries(chatHistory)
      .map(([room, chatRoom]) => {
        if (!chatRoom.messages.length) return null;
        const lastMsg = chatRoom.messages[chatRoom.messages.length - 1];
        return {
          room,
          patientName: chatRoom.patientName,
          patientImage: chatRoom.patientImage,
          message: lastMsg.message,
          timestamp: lastMsg.timestamp,
          read: lastMsg.read,
          file: lastMsg.file
        };
      })
      .filter(Boolean);
      
    console.log("Emitting chat history summary:", summary);
    socket.emit('chat-history', summary);
  });

  socket.on('typing', (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    socket.to(room).emit('typing', { sender });
  });

  socket.on('stop-typing', (data: { room: string; sender: string }) => {
    const { room, sender } = data;
    socket.to(room).emit('stop-typing', { sender });
  });
}
