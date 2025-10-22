import { NextRequest } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema/business";
import { eq, and } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const updateTaskSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "completed", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    dueDate: z.string().datetime().optional(),
    projectId: z.string().uuid().nullable().optional(),
    completedAt: z.string().datetime().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const taskId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(taskId);
        } catch {
            return createApiErrorResponse("Invalid task ID", 400);
        }

        // Get task
        const [task] = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

        if (!task) {
            return createApiErrorResponse("Task not found", 404);
        }

        return createApiResponse(task);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const taskId = params.id;
        const body = await request.json();

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(taskId);
        } catch {
            return createApiErrorResponse("Invalid task ID", 400);
        }

        // Validate request body
        const validatedData = updateTaskSchema.parse(body);

        // Update task
        const [updatedTask] = await db
            .update(tasks)
            .set({
                ...validatedData,
                dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
                completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : null,
                updatedAt: new Date(),
            })
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
            .returning();

        if (!updatedTask) {
            return createApiErrorResponse("Task not found", 404);
        }

        return createApiResponse(updatedTask);
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const taskId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(taskId);
        } catch {
            return createApiErrorResponse("Invalid task ID", 400);
        }

        // Delete task
        const [deletedTask] = await db
            .delete(tasks)
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
            .returning();

        if (!deletedTask) {
            return createApiErrorResponse("Task not found", 404);
        }

        return createApiResponse({ message: "Task deleted successfully" });
    } catch (error) {
        return handleApiError(error);
    }
}