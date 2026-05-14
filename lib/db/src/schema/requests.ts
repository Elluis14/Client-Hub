import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const designRequestsTable = pgTable("design_requests", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requestType: text("request_type"),
  status: text("status").notNull().default("new"),
  projectId: integer("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDesignRequestSchema = createInsertSchema(designRequestsTable).omit({ id: true, createdAt: true });
export type InsertDesignRequest = z.infer<typeof insertDesignRequestSchema>;
export type DesignRequest = typeof designRequestsTable.$inferSelect;
