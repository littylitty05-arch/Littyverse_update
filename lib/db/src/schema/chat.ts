import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gymUsersTable = pgTable("gym_users", {
  id: serial("id").primaryKey(),
  gymId: text("gym_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  deviceId: text("device_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatRoomsTable = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "dm" | "squad"
  name: text("name"),
  createdBy: integer("created_by").references(() => gymUsersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roomMembersTable = pgTable("room_members", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRoomsTable.id),
  userId: integer("user_id").notNull().references(() => gymUsersTable.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  missedWorkoutAlert: boolean("missed_workout_alert").default(true),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRoomsTable.id),
  senderId: integer("sender_id").references(() => gymUsersTable.id),
  senderName: text("sender_name").notNull(),
  senderGymId: text("sender_gym_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // "text" | "bot_log" | "system"
  botData: text("bot_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGymUserSchema = createInsertSchema(gymUsersTable).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(chatRoomsTable).omit({ id: true, createdAt: true });

export type GymUser = typeof gymUsersTable.$inferSelect;
export type ChatRoom = typeof chatRoomsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type InsertGymUser = z.infer<typeof insertGymUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
