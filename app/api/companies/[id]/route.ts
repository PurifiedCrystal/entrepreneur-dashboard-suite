import { NextRequest } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema/business";
import { eq, and } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const updateCompanySchema = z.object({
    name: z.string().min(1).max(255).optional(),
    industry: z.string().max(100).optional(),
    website: z.string().url().optional(),
    description: z.string().optional(),
    phone: z.string().max(50).optional(),
    address: z.string().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const companyId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(companyId);
        } catch {
            return createApiErrorResponse("Invalid company ID", 400);
        }

        // Get company
        const [company] = await db
            .select()
            .from(companies)
            .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)));

        if (!company) {
            return createApiErrorResponse("Company not found", 404);
        }

        return createApiResponse(company);
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
        const companyId = params.id;
        const body = await request.json();

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(companyId);
        } catch {
            return createApiErrorResponse("Invalid company ID", 400);
        }

        // Validate request body
        const validatedData = updateCompanySchema.parse(body);

        // Update company
        const [updatedCompany] = await db
            .update(companies)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)))
            .returning();

        if (!updatedCompany) {
            return createApiErrorResponse("Company not found", 404);
        }

        return createApiResponse(updatedCompany);
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
        const companyId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(companyId);
        } catch {
            return createApiErrorResponse("Invalid company ID", 400);
        }

        // Delete company
        const [deletedCompany] = await db
            .delete(companies)
            .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)))
            .returning();

        if (!deletedCompany) {
            return createApiErrorResponse("Company not found", 404);
        }

        return createApiResponse({ message: "Company deleted successfully" });
    } catch (error) {
        return handleApiError(error);
    }
}