import { NextRequest } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema/business";
import { eq, and, desc, asc, ilike, or } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schemas
const createCompanySchema = z.object({
    name: z.string().min(1).max(255),
    industry: z.string().max(100).optional(),
    website: z.string().url().optional(),
    description: z.string().optional(),
    phone: z.string().max(50).optional(),
    address: z.string().optional(),
});

const updateCompanySchema = createCompanySchema.partial();

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search");
        const industry = searchParams.get("industry");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const offset = (page - 1) * limit;

        // Build query conditions
        const conditions = [eq(companies.userId, user.id)];

        if (search) {
            conditions.push(
                or(
                    ilike(companies.name, `%${search}%`),
                    ilike(companies.industry, `%${search}%`),
                    ilike(companies.description, `%${search}%`),
                    ilike(companies.website, `%${search}%`)
                )
            );
        }

        if (industry) {
            conditions.push(ilike(companies.industry, `%${industry}%`));
        }

        // Build order by
        const orderBy = sortOrder === "asc"
            ? asc(companies[sortBy as keyof typeof companies] as any)
            : desc(companies[sortBy as keyof typeof companies] as any);

        // Get total count
        const totalCount = await db
            .select({ count: companies.id })
            .from(companies)
            .where(and(...conditions));

        // Get companies
        const companiesList = await db
            .select()
            .from(companies)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return createApiResponse({
            data: companiesList,
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
        const validatedData = createCompanySchema.parse(body);

        // Create company
        const [newCompany] = await db
            .insert(companies)
            .values({
                ...validatedData,
                userId: user.id,
            })
            .returning();

        return createApiResponse(newCompany, 201);
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