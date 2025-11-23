import { Server } from 'socket.io';

let io: Server;

export const initWebSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // ✅ Welcome message
    socket.emit('welcome', { message: 'Connected to WebSocket server' });

    // ✅ Ping/pong test
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // ✅ Join room
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // ✅ Broadcast to room
    socket.on('messageToRoom', ({ roomId, message }) => {
      socket.to(roomId).emit('roomMessage', { sender: socket.id, message });
    });

    // ✅ Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

// ✅ External emitter (for cron jobs, services, etc.)
export const emitToAll = (event: string, payload: any) => {
  if (io) io.emit(event, payload);
};
