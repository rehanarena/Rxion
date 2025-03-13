import { Socket } from 'socket.io';

const activeCalls: { [room: string]: any } = {};

export function setupVideoCallHandlers(socket: Socket) {
  // Single "join-room" listener
  socket.on('join-room', (roomId: string) => {
    console.log(`🟢 Socket ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
    console.log("📌 Rooms this socket is in:", socket.rooms);
  
    if (activeCalls[roomId]) {
      console.log("📞 Active call found, emitting call-made:", activeCalls[roomId]);
      socket.emit('call-made', activeCalls[roomId]);
    } else {
      console.log("⚠️ No active call found for this room.");
    }
  });

  socket.on('call-user', (data) => {
    console.log("🔵 call-user event received:", data);
    activeCalls[data.room] = data;
    console.log("📌 Updated activeCalls:", activeCalls);
    socket.to(data.room).emit('call-made', data);
  });

  socket.on('make-answer', (data) => {
    console.log("🟠 make-answer event received:", data);
    if (activeCalls[data.room]) {
      console.log("✅ Call found in activeCalls, deleting...");
      delete activeCalls[data.room];
    } else {
      console.log("⚠️ No active call found to delete.");
    }
    socket.to(data.room).emit('answer-made', data);
  });

  socket.on('reject-call', (data) => {
    delete activeCalls[data.room];
    socket.to(data.room).emit('call-declined', { from: socket.id });
  });

  socket.on('end-call', (data) => {
    delete activeCalls[data.room];
    socket.to(data.room).emit('call-ended', { from: socket.id });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.room).emit('ice-candidate', data.candidate);
  });
}
