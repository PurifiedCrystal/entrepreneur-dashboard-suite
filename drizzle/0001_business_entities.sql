CREATE TYPE "task_status" AS ENUM('todo', 'in_progress', 'completed', 'cancelled');
--> statement-breakpoint
CREATE TYPE "task_priority" AS ENUM('low', 'medium', 'high', 'urgent');
--> statement-breakpoint
CREATE TYPE "project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"user_id" text NOT NULL,
	"project_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"industry" varchar(100),
	"website" varchar(500),
	"description" text,
	"phone" varchar(50),
	"address" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"job_title" varchar(100),
	"notes" text,
	"company" varchar(255),
	"company_id" uuid,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" ("user_id");
--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" ("project_id");
--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" ("status");
--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" ("due_date");
--> statement-breakpoint
CREATE INDEX "companies_user_id_idx" ON "companies" ("user_id");
--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" ("name");
--> statement-breakpoint
CREATE INDEX "contacts_user_id_idx" ON "contacts" ("user_id");
--> statement-breakpoint
CREATE INDEX "contacts_company_id_idx" ON "contacts" ("company_id");
--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" ("email");
--> statement-breakpoint
CREATE INDEX "contacts_name_idx" ON "contacts" ("name");
--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" ("user_id");
--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" ("status");
--> statement-breakpoint
CREATE INDEX "projects_name_idx" ON "projects" ("name");
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;