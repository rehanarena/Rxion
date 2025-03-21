// import { Server, Socket } from 'socket.io';
// import { setupChatHandlers } from './chatHandlers';
// import { setupVideoCallHandlers } from './videoCallHandlers';

// export function initializeSocket(io: Server) {
//   io.on('connection', (socket: Socket) => {
//     console.log("Client connected:", socket.id);
//     setupChatHandlers(socket);
//     setupVideoCallHandlers(socket);

//     socket.on('disconnect', () => {
//       console.log("Client disconnected:", socket.id);
//     });
//   });
// }
