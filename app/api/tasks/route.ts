import { NextRequest } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema/business";
import { eq, and, desc, asc, ilike, or } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schemas
const createTaskSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "completed", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    dueDate: z.string().datetime().optional(),
    projectId: z.string().uuid().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const offset = (page - 1) * limit;

        // Build query conditions
        const conditions = [eq(tasks.userId, user.id)];

        if (status) {
            conditions.push(eq(tasks.status, status as any));
        }

        if (priority) {
            conditions.push(eq(tasks.priority, priority as any));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(tasks.title, `%${search}%`),
                    ilike(tasks.description, `%${search}%`)
                )
            );
        }

        // Build order by
        const orderBy = sortOrder === "asc"
            ? asc(tasks[sortBy as keyof typeof tasks] as any)
            : desc(tasks[sortBy as keyof typeof tasks] as any);

        // Get total count
        const totalCount = await db
            .select({ count: tasks.id })
            .from(tasks)
            .where(and(...conditions));

        // Get tasks
        const tasksList = await db
            .select()
            .from(tasks)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return createApiResponse({
            data: tasksList,
            pagination: {
                page,
                limit,
                total: totalCount.length,
                pages: Math.ceil(totalCount.length / limit),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();

        // Validate request body
        const validatedData = createTaskSchema.parse(body);

        // Create task
        const [newTask] = await db
            .insert(tasks)
            .values({
                ...validatedData,
                userId: user.id,
                dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
                projectId: validatedData.projectId || null,
            })
            .returning();

        return createApiResponse(newTask, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return createApiErrorResponse(
                `Validation error: ${error.errors.map(e => e.message).join(", ")}`,
                400
            );
        }
        return handleApiError(error);
    }
}