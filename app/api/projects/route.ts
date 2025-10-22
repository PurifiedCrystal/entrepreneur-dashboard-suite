import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema/business";
import { eq, and, desc, asc, ilike, or } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schemas
const createProjectSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search");
        const status = searchParams.get("status");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const offset = (page - 1) * limit;

        // Build query conditions
        const conditions = [eq(projects.userId, user.id)];

        if (search) {
            conditions.push(
                or(
                    ilike(projects.name, `%${search}%`),
                    ilike(projects.description, `%${search}%`)
                )
            );
        }

        if (status) {
            conditions.push(eq(projects.status, status as any));
        }

        // Build order by
        const orderBy = sortOrder === "asc"
            ? asc(projects[sortBy as keyof typeof projects] as any)
            : desc(projects[sortBy as keyof typeof projects] as any);

        // Get total count
        const totalCount = await db
            .select({ count: projects.id })
            .from(projects)
            .where(and(...conditions));

        // Get projects
        const projectsList = await db
            .select()
            .from(projects)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return createApiResponse({
            data: projectsList,
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
        const validatedData = createProjectSchema.parse(body);

        // Create project
        const [newProject] = await db
            .insert(projects)
            .values({
                ...validatedData,
                userId: user.id,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
            })
            .returning();

        return createApiResponse(newProject, 201);
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