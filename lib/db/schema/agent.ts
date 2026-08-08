import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

import { teams } from "./account";
import { conversations } from "./chat";

export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  teamId: text("team_id")
    .references(() => teams.id)
    .notNull(),
  key: text("key").notNull(), // (e.g., "core", "marketing_notes")
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: text("id").primaryKey().$defaultFn(nanoid),
  teamId: text("team_id")
    .references(() => teams.id)
    .notNull(),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  status: text("status", { enum: ["draft", "active", "archived"] })
    .default("draft")
    .notNull(),
  schedule: text("schedule"), // cron string or null
  qstashScheduleId: text("qstash_schedule_id"), // to update/delete QStash cron
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Immutable plan — created once, reused every run.
// Output never lives here, only in messages.
export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  workflowId: text("workflow_id")
    .references(() => workflows.id)
    .notNull(),
  stepIndex: integer("step_index").notNull(),
  description: text("description").notNull(), // shown in emails
  toolName: text("tool_name").notNull(), // "web_search" | "format_post" | "llm_response" | etc.
  toolInput: jsonb("tool_input"),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  approvalPrompt: text("approval_prompt"),
  createdAt: timestamp("created_at").defaultNow(),
});

// One row per execution. The conversation holds all messages for that run.
export const workflowRuns = pgTable("workflow_runs", {
  id: serial("id").primaryKey(),
  workflowId: text("workflow_id")
    .references(() => workflows.id)
    .notNull(),
  conversationId: text("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  runNumber: integer("run_number").notNull().default(1),
  status: text("status", {
    enum: ["running", "awaiting_approval", "approved", "completed", "failed"],
  })
    .default("running")
    .notNull(),
  currentStepIndex: integer("current_step_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  teamId: text("team_id")
    .references(() => teams.id)
    .notNull(),

  // Tie it back to the context where it was created
  conversationId: text("conversation_id").references(() => conversations.id),
  runId: integer("run_id").references(() => workflowRuns.id),

  // The type of asset ("image", "social_post", "summary", "document")
  type: text("type").notNull(),

  // A clean, human-readable title (e.g., "LinkedIn Post - AI Trends")
  title: text("title").notNull(),

  // The actual deliverable (a URL for images, markdown text for posts)
  content: text("content").notNull(),

  // Store any extra context (e.g., which platform a post was for)
  metadata: jsonb("metadata").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONS
export const workflowsRelations = relations(workflows, ({ many }) => ({
  workflowSteps: many(workflowSteps),
  workflowRuns: many(workflowRuns),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowSteps.workflowId],
    references: [workflows.id],
  }),
}));

export const workflowRunsRelations = relations(workflowRuns, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowRuns.workflowId],
    references: [workflows.id],
  }),
}));

export type WorkflowRun = typeof workflowRuns.$inferSelect;
