import { NextRequest } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema/business";
import { eq, and, desc, asc, ilike, or } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schemas
const createContactSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().optional(),
    phone: z.string().max(50).optional(),
    jobTitle: z.string().max(100).optional(),
    notes: z.string().optional(),
    company: z.string().max(255).optional(),
    companyId: z.string().uuid().optional(),
});

const updateContactSchema = createContactSchema.partial();

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search");
        const company = searchParams.get("company");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const offset = (page - 1) * limit;

        // Build query conditions
        const conditions = [eq(contacts.userId, user.id)];

        if (search) {
            conditions.push(
                or(
                    ilike(contacts.name, `%${search}%`),
                    ilike(contacts.email, `%${search}%`),
                    ilike(contacts.phone, `%${search}%`),
                    ilike(contacts.company, `%${search}%`)
                )
            );
        }

        if (company) {
            conditions.push(ilike(contacts.company, `%${company}%`));
        }

        // Build order by
        const orderBy = sortOrder === "asc"
            ? asc(contacts[sortBy as keyof typeof contacts] as any)
            : desc(contacts[sortBy as keyof typeof contacts] as any);

        // Get total count
        const totalCount = await db
            .select({ count: contacts.id })
            .from(contacts)
            .where(and(...conditions));

        // Get contacts
        const contactsList = await db
            .select()
            .from(contacts)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return createApiResponse({
            data: contactsList,
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
        const validatedData = createContactSchema.parse(body);

        // Create contact
        const [newContact] = await db
            .insert(contacts)
            .values({
                ...validatedData,
                userId: user.id,
                companyId: validatedData.companyId || null,
            })
            .returning();

        return createApiResponse(newContact, 201);
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