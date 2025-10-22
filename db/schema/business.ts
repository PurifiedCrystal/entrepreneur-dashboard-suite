import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    varchar,
    uuid,
    pgEnum,
    index
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

// Enums for status fields
export const taskStatusEnum = pgEnum("task_status", [
    "todo",
    "in_progress",
    "completed",
    "cancelled"
]);

export const taskPriorityEnum = pgEnum("task_priority", [
    "low",
    "medium",
    "high",
    "urgent"
]);

export const projectStatusEnum = pgEnum("project_status", [
    "planning",
    "active",
    "on_hold",
    "completed",
    "cancelled"
]);

// Tasks table
export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("todo").notNull(),
    priority: taskPriorityEnum("priority").default("medium").notNull(),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
        .references(() => projects.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdIdx: index("tasks_user_id_idx").on(table.userId),
    projectIdIdx: index("tasks_project_id_idx").on(table.projectId),
    statusIdx: index("tasks_status_idx").on(table.status),
    dueDateIdx: index("tasks_due_date_idx").on(table.dueDate),
}));

// Companies table
export const companies = pgTable("companies", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    industry: varchar("industry", { length: 100 }),
    website: varchar("website", { length: 500 }),
    description: text("description"),
    phone: varchar("phone", { length: 50 }),
    address: text("address"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdIdx: index("companies_user_id_idx").on(table.userId),
    nameIdx: index("companies_name_idx").on(table.name),
}));

// Contacts table
export const contacts = pgTable("contacts", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    jobTitle: varchar("job_title", { length: 100 }),
    notes: text("notes"),
    company: varchar("company", { length: 255 }),
    companyId: uuid("company_id")
        .references(() => companies.id, { onDelete: "set null" }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdIdx: index("contacts_user_id_idx").on(table.userId),
    companyIdIdx: index("contacts_company_id_idx").on(table.companyId),
    emailIdx: index("contacts_email_idx").on(table.email),
    nameIdx: index("contacts_name_idx").on(table.name),
}));

// Projects table
export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: projectStatusEnum("status").default("planning").notNull(),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdIdx: index("projects_user_id_idx").on(table.userId),
    statusIdx: index("projects_status_idx").on(table.status),
    nameIdx: index("projects_name_idx").on(table.name),
}));

// Define relations
export const usersRelations = relations(user, ({ many }) => ({
    tasks: many(tasks),
    contacts: many(contacts),
    companies: many(companies),
    projects: many(projects),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
    user: one(user, {
        fields: [tasks.userId],
        references: [user.id],
    }),
    project: one(projects, {
        fields: [tasks.projectId],
        references: [projects.id],
    }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
    user: one(user, {
        fields: [contacts.userId],
        references: [user.id],
    }),
    company: one(companies, {
        fields: [contacts.companyId],
        references: [companies.id],
    }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
    user: one(user, {
        fields: [companies.userId],
        references: [user.id],
    }),
    contacts: many(contacts),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    user: one(user, {
        fields: [projects.userId],
        references: [user.id],
    }),
    tasks: many(tasks),
}));