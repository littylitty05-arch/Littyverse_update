import { Router } from "express";
import { db } from "@workspace/db";
import {
  gymUsersTable,
  chatRoomsTable,
  roomMembersTable,
  messagesTable,
} from "@workspace/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

const router = Router();

function generateGymId(): string {
  const n1 = Math.floor(Math.random() * 900) + 100;
  const n2 = Math.floor(Math.random() * 9000) + 1000;
  return `FIT-${n1}-${n2}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

router.post("/users/register", async (req, res) => {
  try {
    const { deviceId, displayName } = req.body as { deviceId: string; displayName: string };
    if (!deviceId || !displayName) {
      res.status(400).json({ error: "deviceId and displayName required" });
      return;
    }

    const existing = await db
      .select()
      .from(gymUsersTable)
      .where(eq(gymUsersTable.deviceId, deviceId))
      .limit(1);

    if (existing.length > 0) {
      res.json({ user: existing[0] });
      return;
    }

    let gymId = generateGymId();
    let collision = await db
      .select()
      .from(gymUsersTable)
      .where(eq(gymUsersTable.gymId, gymId))
      .limit(1);
    while (collision.length > 0) {
      gymId = generateGymId();
      collision = await db
        .select()
        .from(gymUsersTable)
        .where(eq(gymUsersTable.gymId, gymId))
        .limit(1);
    }

    const [user] = await db
      .insert(gymUsersTable)
      .values({ deviceId, displayName, gymId, avatarInitials: initials(displayName) })
      .returning();

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.get("/users/lookup/:gymId", async (req, res) => {
  const { gymId } = req.params;
  const users = await db
    .select()
    .from(gymUsersTable)
    .where(eq(gymUsersTable.gymId, gymId.toUpperCase()))
    .limit(1);
  if (!users.length) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: users[0] });
});

router.get("/users/me/:deviceId", async (req, res) => {
  const users = await db
    .select()
    .from(gymUsersTable)
    .where(eq(gymUsersTable.deviceId, req.params.deviceId))
    .limit(1);
  if (!users.length) {
    res.status(404).json({ error: "Not registered" });
    return;
  }
  res.json({ user: users[0] });
});

router.post("/rooms", async (req, res) => {
  try {
    const { type, name, memberIds, createdBy } = req.body as {
      type: "dm" | "squad";
      name?: string;
      memberIds: number[];
      createdBy: number;
    };

    const [room] = await db
      .insert(chatRoomsTable)
      .values({ type, name: name ?? null, createdBy })
      .returning();

    const allMemberIds = Array.from(new Set([createdBy, ...memberIds]));
    await db.insert(roomMembersTable).values(
      allMemberIds.map((uid) => ({ roomId: room.id, userId: uid }))
    );

    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.get("/rooms/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const memberships = await db
      .select()
      .from(roomMembersTable)
      .where(eq(roomMembersTable.userId, userId));

    if (!memberships.length) {
      res.json({ rooms: [] });
      return;
    }

    const roomIds = memberships.map((m) => m.roomId);
    const rooms = await db
      .select()
      .from(chatRoomsTable)
      .where(inArray(chatRoomsTable.id, roomIds));

    const roomsWithMembers = await Promise.all(
      rooms.map(async (room) => {
        const members = await db
          .select({ user: gymUsersTable })
          .from(roomMembersTable)
          .innerJoin(gymUsersTable, eq(roomMembersTable.userId, gymUsersTable.id))
          .where(eq(roomMembersTable.roomId, room.id));

        const lastMsg = await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.roomId, room.id))
          .orderBy(desc(messagesTable.createdAt))
          .limit(1);

        return {
          ...room,
          members: members.map((m) => m.user),
          lastMessage: lastMsg[0] ?? null,
        };
      })
    );

    res.json({ rooms: roomsWithMembers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

router.get("/messages/:roomId", async (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const limit = parseInt((req.query.limit as string) ?? "50");
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.roomId, roomId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit);
  res.json({ messages: messages.reverse() });
});

export default router;
