
import { WebSocketServer } from 'ws';
import prisma from './prismaClient.js';

let wss = null;

export function initKDS(server) {
  wss = new WebSocketServer({ server, path: '/kds' });
  wss.on('connection', (ws, req) => {
    console.log('KDS client connected', req.socket.remoteAddress);
    ws.on('message', async (msg) => {
      // This logic was missing, re-adding it.
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === 'update-status') {
          await prisma.order.update({ where: { id: Number(data.orderId) }, data: { status: data.status } });
          notifyKDS({ type: 'order-status', orderId: data.orderId, status: data.status });
        }
      } catch (e) { console.error('kds msg error', e); }
    });
    ws.on('close', ()=> console.log('KDS client disconnected'));
  });
  return wss;
}

export function notifyKDS(payload) {
  if (!wss) return;
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
  wss.clients.forEach((c) => {
    if (c.readyState === c.OPEN) c.send(json);
  });
}
