import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db/schema";
import { processBotCommand } from "./lib/bot";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/api/ws/chat" });

interface ChatClient {
  ws: WebSocket;
  userId: number;
  roomId: number;
  displayName: string;
  gymId: string;
}

const rooms = new Map<number, Set<ChatClient>>();

function getRoomClients(roomId: number): Set<ChatClient> {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  return rooms.get(roomId)!;
}

function broadcastToRoom(roomId: number, payload: object, exceptWs?: WebSocket) {
  const clients = getRoomClients(roomId);
  const data = JSON.stringify(payload);
  for (const client of clients) {
    if (client.ws !== exceptWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

wss.on("connection", (ws) => {
  let client: ChatClient | null = null;

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as Record<string, unknown>;

      if (msg.type === "join") {
        const { userId, roomId, displayName, gymId } = msg as {
          type: string;
          userId: number;
          roomId: number;
          displayName: string;
          gymId: string;
        };
        client = { ws, userId, roomId, displayName, gymId };
        getRoomClients(roomId).add(client);

        broadcastToRoom(roomId, {
          type: "system",
          content: `${displayName} joined`,
          roomId,
          createdAt: new Date().toISOString(),
        }, ws);
        return;
      }

      if (msg.type === "message" && client) {
        const { content } = msg as { type: string; content: string };
        const { roomId, userId, displayName, gymId } = client;

        const botResult = processBotCommand(content, displayName);

        if (botResult.isBot) {
          const botMsg = {
            type: "bot_log",
            content: botResult.text ?? "",
            botData: botResult.data ? JSON.stringify(botResult.data) : null,
            senderName: "LittyBot",
            senderGymId: "FIT-000-0000",
            roomId,
            createdAt: new Date().toISOString(),
          };

          const [saved] = await db
            .insert(messagesTable)
            .values({
              roomId,
              senderId: null,
              senderName: "LittyBot",
              senderGymId: "FIT-000-0000",
              content: botResult.text ?? "",
              type: "bot_log",
              botData: botResult.data ? JSON.stringify(botResult.data) : null,
            })
            .returning();

          const fullBotMsg = { ...botMsg, id: saved.id };
          ws.send(JSON.stringify(fullBotMsg));
          broadcastToRoom(roomId, fullBotMsg, ws);
          return;
        }

        const [saved] = await db
          .insert(messagesTable)
          .values({
            roomId,
            senderId: userId,
            senderName: displayName,
            senderGymId: gymId,
            content,
            type: "text",
            botData: null,
          })
          .returning();

        const outbound = {
          type: "message",
          id: saved.id,
          content,
          senderName: displayName,
          senderGymId: gymId,
          senderId: userId,
          roomId,
          createdAt: saved.createdAt.toISOString(),
        };

        ws.send(JSON.stringify({ ...outbound, isMine: true }));
        broadcastToRoom(roomId, outbound, ws);
        return;
      }

      if (msg.type === "typing" && client) {
        broadcastToRoom(client.roomId, {
          type: "typing",
          displayName: client.displayName,
          roomId: client.roomId,
        }, ws);
      }
    } catch (err) {
      logger.error({ err }, "WS message error");
    }
  });

  ws.on("close", () => {
    if (client) {
      getRoomClients(client.roomId).delete(client);
      broadcastToRoom(client.roomId, {
        type: "system",
        content: `${client.displayName} left`,
        roomId: client.roomId,
        createdAt: new Date().toISOString(),
      });
    }
  });
});

server.listen(port, () => {
  logger.info({ port }, "Server listening");
});
