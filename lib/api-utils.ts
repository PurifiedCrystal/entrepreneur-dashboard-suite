import { auth } from "@/lib/auth";
import { NextRequest, headers } from "next/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return null;
    }

    return session.user;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

export function createApiResponse<T>(
    data: T,
    status: number = 200
) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export function createApiErrorResponse(
    message: string,
    status: number = 400
) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function handleApiError(error: unknown) {
    console.error("API Error:", error);

    if (error instanceof Error) {
        return createApiErrorResponse(error.message, 500);
    }

    return createApiErrorResponse("Internal server error", 500);
}