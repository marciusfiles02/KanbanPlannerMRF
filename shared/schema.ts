import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Definição das colunas do quadro kanban
export const KANBAN_COLUMNS = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
} as const;

export type KanbanColumn = typeof KANBAN_COLUMNS[keyof typeof KANBAN_COLUMNS];

// Definição dos status de tarefas
export const TASK_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  DONE: "done",
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// Definição das cores disponíveis
export const TASK_COLORS = {
  BLUE: "blue",
  GREEN: "green",
  ORANGE: "orange",
  RED: "red",
  PURPLE: "purple",
} as const;

export type TaskColor = typeof TASK_COLORS[keyof typeof TASK_COLORS];

// Esquema da tabela de usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Esquema da tabela de tarefas
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default(TASK_STATUS.NOT_STARTED),
  color: text("color").notNull().default(TASK_COLORS.BLUE),
  column: text("column").notNull().default(KANBAN_COLUMNS.BACKLOG),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas Zod para validação

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum([
    TASK_STATUS.NOT_STARTED,
    TASK_STATUS.IN_PROGRESS, 
    TASK_STATUS.PAUSED, 
    TASK_STATUS.DONE
  ]),
  color: z.enum([
    TASK_COLORS.BLUE,
    TASK_COLORS.GREEN,
    TASK_COLORS.ORANGE,
    TASK_COLORS.RED,
    TASK_COLORS.PURPLE
  ]),
  column: z.enum([
    KANBAN_COLUMNS.BACKLOG,
    KANBAN_COLUMNS.TODO,
    KANBAN_COLUMNS.IN_PROGRESS,
    KANBAN_COLUMNS.REVIEW,
    KANBAN_COLUMNS.DONE
  ]),
  progress: z.number().min(0).max(100)
});

export const updateTaskSchema = insertTaskSchema.partial();

// Tipos de inferência
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
