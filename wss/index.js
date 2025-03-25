// wss/index.js
import { WebSocketServer } from "ws";
import http from "http";
import { app } from "../config/index.js";

const clients = new Set();

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("🟢 Client connected");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("🔴 Client disconnected");
  });
});

export const broadcastUpdate = (data) => {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
};

export { server };
