"use strict";
// socket/videoCallHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoCallHandler = videoCallHandler;
// In-memory store for active calls
const activeCalls = {};
function videoCallHandler(socket, io) {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        if (activeCalls[roomId]) {
            socket.emit('call-made', activeCalls[roomId]);
        }
    });
    socket.on('call-user', (data) => {
        console.log("Call-user event:", data);
        activeCalls[data.room] = data;
        io.to(data.room).emit('call-made', data);
    });
    socket.on('make-answer', (data) => {
        delete activeCalls[data.room];
        io.to(data.room).emit('answer-made', data);
    });
    socket.on('reject-call', (data) => {
        console.log("Reject-call event:", data);
        delete activeCalls[data.room];
        io.to(data.room).emit('call-declined', { from: socket.id });
    });
    socket.on('end-call', (data) => {
        console.log("End-call event:", data);
        delete activeCalls[data.room];
        io.to(data.room).emit('call-ended', { from: socket.id });
    });
    socket.on('ice-candidate', (data) => {
        io.to(data.room).emit('ice-candidate', data.candidate);
    });
}
