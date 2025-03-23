import { WebSocketServer } from 'ws';
import http from 'http';
import { app } from "../config/index";

// Store active clients
const clients = new Set();

const server = http.createServer(app); // wrap app in HTTP server

const wss = new WebSocketServer({ server }); // wrap server in WebSocket server

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('🟢 Client connected');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('🔴 Client disconnected');
  });
});

// Function to broadcast a message to all connected clients
export const broadcastUpdate = (data) => {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
};