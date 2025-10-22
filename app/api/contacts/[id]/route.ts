import { NextRequest } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema/business";
import { eq, and } from "drizzle-orm";
import { requireAuth, createApiResponse, createApiErrorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const updateContactSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(50).optional(),
    jobTitle: z.string().max(100).optional(),
    notes: z.string().optional(),
    company: z.string().max(255).optional(),
    companyId: z.string().uuid().nullable().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();
        const contactId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(contactId);
        } catch {
            return createApiErrorResponse("Invalid contact ID", 400);
        }

        // Get contact
        const [contact] = await db
            .select()
            .from(contacts)
            .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)));

        if (!contact) {
            return createApiErrorResponse("Contact not found", 404);
        }

        return createApiResponse(contact);
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
        const contactId = params.id;
        const body = await request.json();

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(contactId);
        } catch {
            return createApiErrorResponse("Invalid contact ID", 400);
        }

        // Validate request body
        const validatedData = updateContactSchema.parse(body);

        // Update contact
        const [updatedContact] = await db
            .update(contacts)
            .set({
                ...validatedData,
                companyId: validatedData.companyId || null,
                updatedAt: new Date(),
            })
            .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)))
            .returning();

        if (!updatedContact) {
            return createApiErrorResponse("Contact not found", 404);
        }

        return createApiResponse(updatedContact);
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
        const contactId = params.id;

        // Validate UUID
        try {
            const uuid = z.string().uuid().parse(contactId);
        } catch {
            return createApiErrorResponse("Invalid contact ID", 400);
        }

        // Delete contact
        const [deletedContact] = await db
            .delete(contacts)
            .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)))
            .returning();

        if (!deletedContact) {
            return createApiErrorResponse("Contact not found", 404);
        }

        return createApiResponse({ message: "Contact deleted successfully" });
    } catch (error) {
        return handleApiError(error);
    }
}