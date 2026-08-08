// This helps us keep the "UIMessagePart" typing in our database layer
import type { UIDataTypes, UIMessagePart, UITools } from "ai";
import { relations, sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

import { teams, users } from "./account";

export const pgTable = pgTableCreator((name) => name);

/* ======================
   CONVERSATIONS
====================== */
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(nanoid),
  title: text("title").notNull().default("New Conversation"),

  userId: text("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),

  niche: varchar("niche", { length: 50 }).notNull().default("general"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ======================
   MESSAGES
====================== */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),

  // Store the UUID/String ID from the Vercel AI SDK (e.g., 'msg-123')
  // We use this for upserting during the tool-streaming process
  sdkId: text("sdk_id").notNull().unique(),

  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'

  /**
   * The new 'parts' architecture with full Generic support.
   * We use 'any' for the generic defaults in the schema definition
   * so it accepts any tool/data part your agents generate.
   */
  parts: jsonb("parts")
    .$type<Array<UIMessagePart<UIDataTypes, UITools>>>()
    .notNull(),

  metadata: jsonb("metadata").$type<Record<string, unknown>>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ======================
   RELATIONS
====================== */
export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    team: one(teams, {
      fields: [conversations.teamId],
      references: [teams.id],
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

/* ======================
   TYPES
====================== */

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
