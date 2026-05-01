import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-utils";

/**
 * GET /api/users
 * List all users in the company — Admin only.
 * Returns users sorted by creation date, excluding password hashes.
 */
export async function GET(request: NextRequest) {
  try {
    const [user, errorResponse] = requireRole(request, "ADMIN");
    if (errorResponse) return errorResponse;

    const users = await prisma.user.findMany({
      where: { company_id: user.company_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        _count: {
          select: { project_memberships: true },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
