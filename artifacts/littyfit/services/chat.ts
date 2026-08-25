import Constants from "expo-constants";

const domain = Constants.expoConfig?.extra?.domain
  ?? process.env.EXPO_PUBLIC_DOMAIN
  ?? "";

export const API_BASE = domain
  ? `https://${domain}/api/chat`
  : "/api/chat";

export const WS_URL = domain
  ? `wss://${domain}/api/ws/chat`
  : "ws://localhost:8080/api/ws/chat";

export interface GymUser {
  id: number;
  gymId: string;
  displayName: string;
  avatarInitials: string;
  deviceId: string;
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  type: "dm" | "squad";
  name: string | null;
  createdBy: number | null;
  createdAt: string;
  members: GymUser[];
  lastMessage: ChatMessage | null;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number | null;
  senderName: string;
  senderGymId: string;
  content: string;
  type: "text" | "bot_log" | "system";
  botData?: string | null;
  createdAt: string;
  isMine?: boolean;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function registerUser(deviceId: string, displayName: string): Promise<GymUser> {
  const data = await apiFetch("/users/register", {
    method: "POST",
    body: JSON.stringify({ deviceId, displayName }),
  });
  return data.user;
}

export async function getMe(deviceId: string): Promise<GymUser | null> {
  try {
    const data = await apiFetch(`/users/me/${deviceId}`);
    return data.user;
  } catch {
    return null;
  }
}

export async function lookupUser(gymId: string): Promise<GymUser | null> {
  try {
    const data = await apiFetch(`/users/lookup/${gymId}`);
    return data.user;
  } catch {
    return null;
  }
}

export async function createRoom(params: {
  type: "dm" | "squad";
  name?: string;
  memberIds: number[];
  createdBy: number;
}): Promise<ChatRoom> {
  const data = await apiFetch("/rooms", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return data.room;
}

export async function getRooms(userId: number): Promise<ChatRoom[]> {
  const data = await apiFetch(`/rooms/${userId}`);
  return data.rooms;
}

export async function getMessages(roomId: number): Promise<ChatMessage[]> {
  const data = await apiFetch(`/messages/${roomId}`);
  return data.messages;
}
