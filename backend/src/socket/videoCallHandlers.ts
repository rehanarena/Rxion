// socket/videoCallHandler.ts

import { Socket, Server } from 'socket.io';

// In-memory store for active calls
const activeCalls: { [room: string]: any } = {};

export function videoCallHandler(socket: Socket, io: Server) {
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    if (activeCalls[roomId]) {
      socket.emit('call-made', activeCalls[roomId]);
    }
  });

  socket.on('call-user', (data: { room: string; [key: string]: any }) => {
    console.log("Call-user event:", data);
    activeCalls[data.room] = data;
    io.to(data.room).emit('call-made', data);
  });

  socket.on('make-answer', (data: { room: string; [key: string]: any }) => {
    delete activeCalls[data.room];
    io.to(data.room).emit('answer-made', data);
  });

  socket.on('reject-call', (data: { room: string; [key: string]: any }) => {
    console.log("Reject-call event:", data);
    delete activeCalls[data.room];
    io.to(data.room).emit('call-declined', { from: socket.id });
  });

  socket.on('end-call', (data: { room: string; [key: string]: any }) => {
    console.log("End-call event:", data);
    delete activeCalls[data.room];
    io.to(data.room).emit('call-ended', { from: socket.id });
  });

  socket.on('ice-candidate', (data: { room: string; candidate: any }) => {
    io.to(data.room).emit('ice-candidate', data.candidate);
  });
}
