import { Message } from "@ctypes/location";
import { WebSocket, WebSocketServer } from "ws";
import http from "http";

export const initWS = (server: http.Server): http.Server => {
  const wss = new WebSocketServer({ server });

  const orderClients = new Map<string, Set<WebSocket>>();

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (data: Buffer) => {
      const msg: Message = JSON.parse(data.toString());

      if (msg.type === "JOIN_ORDER") {
        if (!orderClients.has(msg.orderId)) {
          orderClients.set(msg.orderId, new Set());
        }
        orderClients.get(msg.orderId)!.add(ws);
      }

      if (msg.type === "RIDER_LOCATION") {
        const clients = orderClients.get(msg.orderId);
        if (!clients) return;

        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }
    });

    ws.on("close", () => {
      orderClients.forEach((clients) => clients.delete(ws));
    });
  });

  return server;
};
