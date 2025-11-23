import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initWebSocket } from './websocket/gateway.js';
import { loadCronJobs } from './jobs/index.js';
import { loadServices } from './loaders/services.js';
import { appEvents } from './events/index.js';

const PORT = env.PORT || 5000;

const start = async () => {
  const httpServer = http.createServer(app);

  initWebSocket(httpServer);
  await loadServices();
  await loadCronJobs();

  appEvents.emit('server:started', { time: new Date().toISOString() });

  httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

start();
