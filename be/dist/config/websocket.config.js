"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWS = void 0;
const ws_1 = require("ws");
const initWS = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    const orderClients = new Map();
    wss.on("connection", (ws) => {
        ws.on("message", (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === "JOIN_ORDER") {
                if (!orderClients.has(msg.orderId)) {
                    orderClients.set(msg.orderId, new Set());
                }
                orderClients.get(msg.orderId).add(ws);
            }
            if (msg.type === "RIDER_LOCATION") {
                const clients = orderClients.get(msg.orderId);
                if (!clients)
                    return;
                clients.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
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
exports.initWS = initWS;
