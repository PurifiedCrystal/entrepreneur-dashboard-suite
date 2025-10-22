import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema/business";
import { eq, and } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const updateProjectSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const projectId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(projectId);
        } catch {
            return createApiErrorResponse("Invalid project ID", 400);
        }

        // Get project
        const [project] = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));

        if (!project) {
            return createApiErrorResponse("Project not found", 404);
        }

        return createApiResponse(project);
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
        const projectId = params.id;
        const body = await request.json();

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(projectId);
        } catch {
            return createApiErrorResponse("Invalid project ID", 400);
        }

        // Validate request body
        const validatedData = updateProjectSchema.parse(body);

        // Update project
        const [updatedProject] = await db
            .update(projects)
            .set({
                ...validatedData,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
                updatedAt: new Date(),
            })
            .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
            .returning();

        if (!updatedProject) {
            return createApiErrorResponse("Project not found", 404);
        }

        return createApiResponse(updatedProject);
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
        const projectId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(projectId);
        } catch {
            return createApiErrorResponse("Invalid project ID", 400);
        }

        // Delete project
        const [deletedProject] = await db
            .delete(projects)
            .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
            .returning();

        if (!deletedProject) {
            return createApiErrorResponse("Project not found", 404);
        }

        return createApiResponse({ message: "Project deleted successfully" });
    } catch (error) {
        return handleApiError(error);
    }
}