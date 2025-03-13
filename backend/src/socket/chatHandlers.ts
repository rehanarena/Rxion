import { Socket } from 'socket.io';

interface ChatRoom {
  patientName: string;
  patientImage: string;
  messages: Array<{ sender: string; message: string; timestamp: Date }>;
}

const chatHistory: { [room: string]: ChatRoom } = {};

export function setupChatHandlers(socket: Socket) {
  socket.on('join-chat', (room: string) => {
    socket.join(room);
    if (!chatHistory[room]) {
      chatHistory[room] = { patientName: "", patientImage: "", messages: [] };
    }
    socket.emit('chat-history', chatHistory[room].messages);
  });

  socket.on('send-message', (data: { room: string; message: string; sender: string; patientName?: string; patientImage?: string }) => {
    const { room, message, sender, patientName, patientImage } = data;
    const msg = { sender, message, timestamp: new Date() };

    // Initialize or update room metadata
    if (!chatHistory[room]) {
      chatHistory[room] = { patientName: patientName || "", patientImage: patientImage || "", messages: [] };
    } else {
      if (!chatHistory[room].patientName && patientName) {
        chatHistory[room].patientName = patientName;
      }
      if (!chatHistory[room].patientImage && patientImage) {
        chatHistory[room].patientImage = patientImage;
      }
    }
    chatHistory[room].messages.push(msg);
    socket.to(room).emit('receive-message', msg);
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
        };
      })
      .filter(Boolean);
    socket.emit('chat-history', summary);
  });

  socket.on('typing', (data: { room: string; sender: string }) => {
    socket.to(data.room).emit('typing', { sender: data.sender });
  });

  socket.on('stop-typing', (data: { room: string; sender: string }) => {
    socket.to(data.room).emit('stop-typing', { sender: data.sender });
  });
}
